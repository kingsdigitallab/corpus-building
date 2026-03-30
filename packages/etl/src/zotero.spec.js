import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    extractZoteroKeysFromXML,
    fetchZoteroData,
    parseXML,
} from "./zotero.js";

describe("parseXML", () => {
    it("should parse valid XML string", async () => {
        const xml = `<root><child>text</child></root>`;
        const result = await parseXML(xml);
        expect(result).toBeTruthy();
        expect(result.root.child).toBe("text");
    });

    it("should return null for invalid XML", async () => {
        const result = await parseXML("<invalid><unclosed>");
        expect(result).toBeNull();
    });

    it("should return null for empty string", async () => {
        const result = await parseXML("");
        expect(result).toBeNull();
    });
});

describe("extractZoteroKeysFromXML", () => {
    it("should extract key from edition source", () => {
        const xml = {
            TEI: {
                text: {
                    body: {
                        div: [
                            {
                                type: "edition",
                                source: "https://www.zotero.org/groups/382445/items/ABC123",
                            },
                        ],
                    },
                },
            },
        };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toEqual(["ABC123"]);
    });

    it("should extract keys from bibliography ptr targets", () => {
        const xml = {
            TEI: {
                text: {
                    body: {
                        div: [
                            {
                                type: "bibliography",
                                listBibl: {
                                    bibl: [
                                        {
                                            ptr: {
                                                target:
                                                    "https://www.zotero.org/groups/382445/items/KEY1",
                                            },
                                        },
                                        {
                                            ptr: {
                                                target:
                                                    "https://www.zotero.org/groups/382445/items/KEY2",
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toContain("KEY1");
        expect(keys).toContain("KEY2");
    });

    it("should extract keys from both edition and bibliography", () => {
        const xml = {
            TEI: {
                text: {
                    body: {
                        div: [
                            {
                                type: "edition",
                                source: "https://www.zotero.org/groups/382445/items/ED_KEY",
                            },
                            {
                                type: "bibliography",
                                listBibl: {
                                    bibl: {
                                        ptr: {
                                            target:
                                                "https://www.zotero.org/groups/382445/items/BIB_KEY",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toContain("ED_KEY");
        expect(keys).toContain("BIB_KEY");
        expect(keys).toHaveLength(2);
    });

    it("should skip non-zotero sources", () => {
        const xml = {
            TEI: {
                text: {
                    body: {
                        div: [
                            {
                                type: "edition",
                                source: "https://other-source.com/items/ABC",
                            },
                        ],
                    },
                },
            },
        };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toEqual([]);
    });

    it("should return empty array for XML with no divs", () => {
        const xml = { TEI: { text: { body: {} } } };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toEqual([]);
    });

    it("should deduplicate keys", () => {
        const xml = {
            TEI: {
                text: {
                    body: {
                        div: [
                            {
                                type: "edition",
                                source: "https://www.zotero.org/groups/382445/items/SAME_KEY",
                            },
                            {
                                type: "bibliography",
                                listBibl: {
                                    bibl: {
                                        ptr: {
                                            target:
                                                "https://www.zotero.org/groups/382445/items/SAME_KEY",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toEqual(["SAME_KEY"]);
    });

    it("should handle listBibl as an array", () => {
        const xml = {
            TEI: {
                text: {
                    body: {
                        div: [
                            {
                                type: "bibliography",
                                listBibl: [
                                    {
                                        bibl: {
                                            ptr: {
                                                target:
                                                    "https://www.zotero.org/groups/382445/items/K1",
                                            },
                                        },
                                    },
                                    {
                                        bibl: {
                                            ptr: {
                                                target:
                                                    "https://www.zotero.org/groups/382445/items/K2",
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        };
        const keys = extractZoteroKeysFromXML(xml);
        expect(keys).toContain("K1");
        expect(keys).toContain("K2");
    });
});

describe("fetchZoteroData", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return null for empty itemKey", async () => {
        const result = await fetchZoteroData(null);
        expect(result).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it("should return null on failed first request", async () => {
        fetch.mockResolvedValueOnce({ ok: false, status: 404 });
        const result = await fetchZoteroData("BAD_KEY");
        expect(result).toBeNull();
    });

    it("should return null on failed citation request", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({ data: { language: "english" } }),
            })
            .mockResolvedValueOnce({ ok: false, status: 500 });

        const result = await fetchZoteroData("KEY1");
        expect(result).toBeNull();
    });

    it("should extract data from successful English response", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({ data: { language: "english" } }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: {
                            title: " A Title ",
                            creators: [
                                { creatorType: "author", lastName: " Smith " },
                                { creatorType: "editor", lastName: "Jones" },
                                { creatorType: "author", lastName: " Doe " },
                            ],
                            date: " 2020 ",
                        },
                        citation: '<span>Some citation.</span>',
                        links: { alternate: { href: "https://example.com" } },
                    }),
            });

        const result = await fetchZoteroData("KEY1");

        expect(result).toEqual({
            title: "A Title",
            author: "Smith, Doe",
            date: "2020",
            citation: "<span>Some citation</span>",
            uri: "https://example.com",
        });

        // Verify second request used en-GB locale
        const secondCall = fetch.mock.calls[1][0];
        expect(secondCall).toContain("locale=en-GB");
    });

    it("should use Italian locale for Italian language", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({ data: { language: "Italian" } }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: {
                            title: "Titolo",
                            creators: [],
                            date: null,
                        },
                        citation: "<span>Cit.</span>",
                        links: { alternate: { href: "https://example.it" } },
                    }),
            });

        await fetchZoteroData("IT_KEY");

        const secondCall = fetch.mock.calls[1][0];
        expect(secondCall).toContain("locale=it-IT");
    });

    it("should use German locale for German language", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({ data: { language: "german" } }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        data: {
                            title: "Titel",
                            creators: [],
                            date: null,
                        },
                        citation: "<span>Zit.</span>",
                        links: { alternate: { href: "https://example.de" } },
                    }),
            });

        await fetchZoteroData("DE_KEY");

        const secondCall = fetch.mock.calls[1][0];
        expect(secondCall).toContain("locale=de-DE");
    });

    it("should return null on network error", async () => {
        fetch.mockRejectedValueOnce(new Error("Network error"));
        const result = await fetchZoteroData("ERR_KEY");
        expect(result).toBeNull();
    });
});
