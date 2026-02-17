import { describe, it, expect, vi } from "vitest";
import { escapeJson, escapeTikz, escapeXml, generateRandomSeed, hashString, isNullOrWhiteSpace, readLine, unescapeJson, unescapeXml, withoutExtension } from "../../src/utils/string";

describe("hashString()", () => {
    it("returns 0 for empty string", () => {
        expect(hashString("")).toBe(0);
    });

    it("generates consistent unsigned 32-bit integer", () => {
        const result = hashString("hello");
        expect(result).toBe(99162322);
        expect(result).toBeGreaterThanOrEqual(0);
    });
});

describe("generateRandomSeed()", () => {
    it("generates a string of correct length with padding", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.0123);
        expect(generateRandomSeed(5)).toBe("01230");
        vi.restoreAllMocks();
    });
});

describe("isNullOrWhiteSpace()", () => {
    it("identifies empty, null, or whitespace strings", () => {
        expect(isNullOrWhiteSpace(null)).toBe(true);
        expect(isNullOrWhiteSpace(undefined)).toBe(true);
        expect(isNullOrWhiteSpace("   ")).toBe(true);
        expect(isNullOrWhiteSpace("content")).toBe(false);
    });
});

describe("JSON Escaping", () => {
    const original = `path\\to "file"`;
    const escaped = `path\\\\to \\"file\\"`;

    it("escapes backslashes and quotes", () => {
        expect(escapeJson(original)).toBe(escaped);
    });

    it("unescapes backslashes and quotes", () => {
        expect(unescapeJson(escaped)).toBe(original);
    });
});

describe("XML Escaping", () => {
    it("escapes special characters", () => {
        expect(escapeXml(`"A & B" <tag>`)).toBe(`&quot;A &amp; B&quot; &lt;tag&gt;`);
    });

    it("unescapes entities", () => {
        expect(unescapeXml("&lt;body&gt;")).toBe("<body>");
    });
});

describe("escapeTikz()", () => {
    it("converts LaTeX special characters", () => {
        expect(escapeTikz("10% & $5")).toBe("10\\% \\& \\$5");
        expect(escapeTikz("line1\nline2")).toBe("line1\\\\line2");
    });
});

describe("withoutExtension()", () => {
    it("removes extension from filename", () => {
        expect(withoutExtension("image.png")).toBe("image");
        expect(withoutExtension("archive.tar.gz")).toBe("archive.tar");
        expect(withoutExtension("no-extension")).toBe("no-extension");
    });
});

describe("readLine()", () => {
    const content = "first\nsecond\nthird";

    it("reads the first line and provides next start index", () => {
        const result = readLine(content, 0);
        expect(result.line).toBe("first");
        expect(result.nextStart).toBe(6);
    });

    it("returns -1 for nextStart at end of string", () => {
        const result = readLine("last", 0);
        expect(result.line).toBe("last");
        expect(result.nextStart).toBe(-1);
    });
});