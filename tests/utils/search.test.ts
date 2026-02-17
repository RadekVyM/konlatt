import { describe, it, expect } from "vitest";
import { searchStringFilter, searchTermsToRegex, toSearchTerms } from "../../src/utils/search";

describe("searchStringFilter()", () => {
    it("should return true if all terms are present (case-insensitive)", () => {
        const result = searchStringFilter("Hello World", ["hello", "WORLD"]);
        expect(result).toBe(true);
    });

    it("should return false if any term is missing", () => {
        const result = searchStringFilter("Hello World", ["hello", "test"]);
        expect(result).toBe(false);
    });
});

describe("searchTermsToRegex()", () => {
    it("should return a case-insensitive regex with indices (d flag)", () => {
        const regex = searchTermsToRegex(["foo", "bar"]);
        expect(regex).toBeInstanceOf(RegExp);
        expect(regex?.flags).toContain("i");
        expect(regex?.flags).toContain("d");
        expect("FOO".match(regex!)).toBeTruthy();
    });

    it("should escape special regex characters", () => {
        const regex = searchTermsToRegex(["h.i"]);
        // Should match literal "h.i", not "hai"
        expect(regex).toBeInstanceOf(RegExp);
        expect("h.i".match(regex!)).toBeTruthy();
        expect("hai".match(regex!)).toBeNull();
    });

    it("should return undefined for empty arrays", () => {
        expect(searchTermsToRegex([])).toBeUndefined();
    });
});

describe("toSearchTerms()", () => {
    it("should split by spaces and remove empty strings", () => {
        const result = toSearchTerms("  hello   world  ");
        expect(result).toEqual(["hello", "world"]);
    });

    it("should return an empty array for empty or whitespace-only strings", () => {
        expect(toSearchTerms("   ")).toEqual([]);
    });
});