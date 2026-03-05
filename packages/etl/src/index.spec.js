import { describe, it, expect } from "vitest";
import { extractLemmas } from "./index.js";

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
