import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    extractZoteroKeysFromXML,
    fetchZoteroData,
    fetchZoteroDataBatch,
    getLocale,
    parseXML,
    toZoteroRecord,
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

describe("getLocale", () => {
    it("should default to en-GB for missing or unknown languages", () => {
        expect(getLocale(undefined)).toBe("en-GB");
        expect(getLocale("")).toBe("en-GB");
        expect(getLocale("English")).toBe("en-GB");
        expect(getLocale("lat")).toBe("en-GB");
    });

    it("should map known languages to their locale", () => {
        expect(getLocale("german")).toBe("de-DE");
        expect(getLocale("ge")).toBe("de-DE");
        expect(getLocale("Italian")).toBe("it-IT");
        expect(getLocale("it")).toBe("it-IT");
        expect(getLocale("french")).toBe("fr-FR");
        expect(getLocale("fr")).toBe("fr-FR");
        expect(getLocale("spanish")).toBe("es-ES");
        expect(getLocale("es")).toBe("es-ES");
    });
});

describe("toZoteroRecord", () => {
    it("should map a citation response item to a Zotero record", () => {
        const item = {
            key: "KEY1",
            data: {
                title: " A Title ",
                creators: [
                    { creatorType: "author", lastName: " Smith " },
                    { creatorType: "editor", lastName: "Jones" },
                    { creatorType: "author", lastName: " Doe " },
                ],
                date: " 2020 ",
            },
            citation: "<span>Some citation.</span>",
            links: { alternate: { href: "https://example.com" } },
        };

        expect(toZoteroRecord(item)).toEqual({
            title: "A Title",
            author: "Smith, Doe",
            date: "2020",
            citation: "<span>Some citation</span>",
            uri: "https://example.com",
        });
    });
});

describe("fetchZoteroDataBatch", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const dataItem = (key, language) => ({
        key,
        data: { language },
    });

    const citationItem = (key, title) => ({
        key,
        data: { title, creators: [], date: "2020" },
        citation: `<span>${title}.</span>`,
        links: {
            alternate: { href: `https://www.zotero.org/groups/isicily/items/${key}` },
        },
    });

    it("should fetch a batch with one data call and one citation call per locale, preserving key order", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () =>
                    Promise.resolve([
                        dataItem("K2", "Italian"),
                        dataItem("K1", "English"),
                    ]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve([citationItem("K2", "Title2")]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve([citationItem("K1", "Title1")]),
            });

        const result = await fetchZoteroDataBatch(["K2", "K1"]);

        expect(fetch).toHaveBeenCalledTimes(3);
        expect(fetch.mock.calls[0][0]).toContain("itemKey=K2,K1");
        expect(fetch.mock.calls[1][0]).toContain("locale=it-IT");
        expect(fetch.mock.calls[2][0]).toContain("locale=en-GB");
        expect(Object.keys(result)).toEqual(["K2", "K1"]);
        expect(result.K1).toEqual({
            title: "Title1",
            author: "",
            date: "2020",
            citation: "<span>Title1</span>",
            uri: "https://www.zotero.org/groups/isicily/items/K1",
        });
        expect(result.K2.title).toBe("Title2");
    });

    it("should split keys into chunks of up to 50 items", async () => {
        const keys = Array.from({ length: 51 }, (_, i) => `K${i}`);
        fetch.mockImplementation((url) => {
            const itemKeys = new URL(url).searchParams.get("itemKey").split(",");
            const isCitation = url.includes("include=citation");
            const items = itemKeys.map((key) =>
                isCitation ? citationItem(key, `Title ${key}`) : dataItem(key, "English"),
            );
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve(items),
            });
        });

        const result = await fetchZoteroDataBatch(keys);

        expect(Object.keys(result)).toEqual(keys);
        // 2 data requests + 2 citation requests (one per chunk)
        expect(fetch).toHaveBeenCalledTimes(4);
        expect(fetch.mock.calls[0][0]).toContain(
            `itemKey=${Array.from({ length: 50 }, (_, i) => `K${i}`).join(",")}`,
        );
        expect(fetch.mock.calls[2][0]).toContain("itemKey=K50");
    });

    it("should retry a rate-limited request and honour Retry-After", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: false,
                status: 429,
                headers: { get: () => "0" },
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve([dataItem("K1", "English")]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve([citationItem("K1", "Title1")]),
            });

        const result = await fetchZoteroDataBatch(["K1"]);

        expect(fetch).toHaveBeenCalledTimes(3);
        expect(fetch.mock.calls[0][0]).toBe(fetch.mock.calls[1][0]);
        expect(result.K1.title).toBe("Title1");
    });

    it("should fall back to individual requests when the batch request fails", async () => {
        fetch
            .mockResolvedValueOnce({ ok: false, status: 500 })
            // individual fallback for K1 succeeds
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: { language: "English" } }),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () =>
                    Promise.resolve({
                        data: { title: "Title1", creators: [], date: "2020" },
                        citation: "<span>Title1.</span>",
                        links: {
                            alternate: { href: "https://example.com/1" },
                        },
                    }),
            })
            // individual fallback for K2 fails
            .mockResolvedValueOnce({ ok: false, status: 404 });

        const result = await fetchZoteroDataBatch(["K1", "K2"]);

        expect(result.K1.title).toBe("Title1");
        expect(result.K2).toBeUndefined();
        expect(fetch).toHaveBeenCalledTimes(4);
    });

    it("should retry keys missing from the batch response individually", async () => {
        fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve([dataItem("K1", "English")]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve([citationItem("K1", "Title1")]),
            })
            // individual retry for K2, missing from the Zotero library
            .mockResolvedValueOnce({ ok: false, status: 404 });

        const result = await fetchZoteroDataBatch(["K1", "K2"]);

        expect(Object.keys(result)).toEqual(["K1"]);
        expect(fetch).toHaveBeenCalledTimes(3);
        expect(fetch.mock.calls[2][0]).toContain("/items/K2");
    });
});
