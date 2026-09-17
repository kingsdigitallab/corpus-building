import { describe, it, expect } from "vitest";
import * as cheerio from "cheerio";
import { extractLemmas, getHandnote } from "./index.js";

describe("extractLemmas", () => {
    it("should extract lemmas from spans with data-lemma attribute", async () => {
        const html = `
      <div>
        <span data-lemma="verbum" data-text="word">word</span>
        <span data-lemma="nomen" data-text="name">name</span>
      </div>
    `;
        const result = await extractLemmas(html);
        expect(result.lemmas).toEqual(["verbum", "nomen"]);
        expect(result.text).toEqual(["word", "name"]);
    });

    it("should extract text from spans with data-text only", async () => {
        const html = `<div><span data-text="hello">hello</span></div>`;
        const result = await extractLemmas(html);
        expect(result.lemmas).toEqual([]);
        expect(result.text).toEqual(["hello"]);
    });

    it("should extract lemmas from spans with data-lemma only", async () => {
        const html = `<div><span data-lemma="verbum">word</span></div>`;
        const result = await extractLemmas(html);
        expect(result.lemmas).toEqual(["verbum"]);
        expect(result.text).toEqual([]);
    });

    it("should return empty arrays for HTML with no relevant spans", async () => {
        const html = `<div><p>No spans here</p></div>`;
        const result = await extractLemmas(html);
        expect(result.lemmas).toEqual([]);
        expect(result.text).toEqual([]);
    });

    it("should normalize whitespace in text", async () => {
        const html = `<div><span data-text="  hello   world  ">hello world</span></div>`;
        const result = await extractLemmas(html);
        expect(result.text).toEqual(["hello world"]);
    });

    it("should preserve the original HTML in the result", async () => {
        const html = `<span data-lemma="verbum">word</span>`;
        const result = await extractLemmas(html);
        expect(result.html).toBe(html);
    });

    it("should throw for null input", async () => {
        await expect(extractLemmas(null)).rejects.toThrow(
            "HTML input must be a non-empty string"
        );
    });

    it("should throw for empty string input", async () => {
        await expect(extractLemmas("")).rejects.toThrow(
            "HTML input must be a non-empty string"
        );
    });

    it("should throw for non-string input", async () => {
        await expect(extractLemmas(42)).rejects.toThrow(
            "HTML input must be a non-empty string"
        );
    });
});

describe("getHandnote", () => {
    const ANNOTATOR_SOURCE = "https://kingsdigitallab.github.io/crossreads/annotator.html";

    const xml = (inner) =>
        `<TEI xmlns="http://www.tei-c.org/ns/1.0"><teiHeader><fileDesc><sourceDesc><msDesc><physDesc><handDesc><handNote>${inner}</handNote></handDesc></physDesc></msDesc></sourceDesc></fileDesc></teiHeader></TEI>`;

    // getHandnote expects a cheerio document, as built by the ETL for each inscription.
    const xmlDocument = (inner) => cheerio.load(xml(inner), { xmlMode: true }, false);

    it("should return a text-only lettering description", () => {
        expect(getHandnote(xmlDocument("<p>Neatly and regularly cut letters.</p>"))).toEqual([
            { id: undefined, html: "Neatly and regularly cut letters." },
        ]);
    });

    it("should return the description that precedes the annotator Types list", () => {
        const source = `<p>The letters are regular.</p><p source="${ANNOTATOR_SOURCE}">Types list: <ref target="https://example.org/t1">Α type1</ref></p>`;
        expect(getHandnote(xmlDocument(source))).toEqual([
            { id: undefined, html: "The letters are regular." },
        ]);
    });

    it("should return an empty list when the handNote only has a Types list", () => {
        const source = `<p source="${ANNOTATOR_SOURCE}">Types list: <ref target="https://example.org/t1">Δ type2</ref></p>`;
        expect(getHandnote(xmlDocument(source))).toEqual([]);
    });

    it("should skip empty paragraphs before locus elements", () => {
        expect(
            getHandnote(xmlDocument('<p/><locus from="line1" to="line1">Line 1</locus>'))
        ).toEqual([]);
    });

    it("should render refs as html links in document order", () => {
        const source = '<p>Less regular than <ref target="http://example.org/ISic000832">ISic000832</ref>. Omicron is full.</p>';
        expect(getHandnote(xmlDocument(source))).toEqual([
            {
                id: undefined,
                html: 'Less regular than <a href="http://example.org/ISic000832" target="_blank">ISic000832</a>. Omicron is full.',
            },
        ]);
    });

    it("should escape html special characters", () => {
        expect(getHandnote(xmlDocument("<p>Interpuncts similar to a '>'.</p>"))).toEqual([
            { id: undefined, html: "Interpuncts similar to a '&gt;'." },
        ]);
        expect(getHandnote(xmlDocument("<p>AT&amp;T style.</p>"))).toEqual([
            { id: undefined, html: "AT&amp;T style." },
        ]);
    });

    it("should collapse whitespace runs in source text", () => {
        const source = "<p>Deeply cut letters.\n                                    Y and T are tall;  possibly  twice.</p>";
        expect(getHandnote(xmlDocument(source))).toEqual([
            { id: undefined, html: "Deeply cut letters. Y and T are tall; possibly twice." },
        ]);
    });
});
