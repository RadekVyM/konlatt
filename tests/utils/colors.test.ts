import { describe, expect, it } from "vitest";
import { createHsvaColor, HsvaColor } from "../../src/types/HsvaColor";
import { hexaToHsva, hsvaToHexa } from "../../src/utils/colors";

describe("hsvaToHexa()", () => {
    it("should convert Red (0, 1, 1, 1) to #ff0000ff", () => {
        const hsva = createHsvaColor(0, 1, 1, 1);
        expect(hsvaToHexa(hsva)).toBe("#ff0000ff");
    });

    it("should convert Blue (240, 1, 1, 0.5) to #0000ff80 (50% alpha)", () => {
        const hsva = createHsvaColor(240, 1, 1, 0.5);
        expect(hsvaToHexa(hsva)).toBe("#0000ff80");
    });

    it("should convert Gray (0, 0, 0.5, 1) to #808080ff", () => {
        const hsva = createHsvaColor(0, 0, 0.5, 1);
        expect(hsvaToHexa(hsva)).toBe("#808080ff");
    });

    it("should convert a specific color (30, 0.5, 0.8, 0.75) to #cc9966bf", () => {
        const hsva = createHsvaColor(30, 0.5, 0.8, 0.75);
        expect(hsvaToHexa(hsva)).toBe("#cc9966bf");
    });

    it("should convert a specific color (155, 0.59, 0.52, 1) to #cc9966bf", () => {
        const hsva = createHsvaColor(155, 0.59, 0.52, 1);
        expect(hsvaToHexa(hsva)).toBe("#368564ff");
    });

    it("should handle hue values >= 360 (e.g., 480 is Green)", () => {
        const hsva = createHsvaColor(480, 1, 1, 1);
        expect(hsvaToHexa(hsva)).toBe("#00ff00ff");
    });
});

describe("hexaToHsva()", () => {
    it("should convert #ff00ffff (Magenta) to HSVA", () => {
        const expected = createHsvaColor(300, 1, 1, 1);
        const actual = hexaToHsva("#ff00ffff");
        expectHsvaToBeCloseTo(actual, expected);
    });

    it("should convert 6-digit hex #00ffffff (Cyan) to HSVA", () => {
        const expected = createHsvaColor(180, 1, 1, 1);
        const actual = hexaToHsva("#00ffff");
        expectHsvaToBeCloseTo(actual, expected);
    });
    
    it("should convert 3-digit hex #f00 (Red) to HSVA", () => {
        const expected = createHsvaColor(0, 1, 1, 1);
        const actual = hexaToHsva("#f00");
        expectHsvaToBeCloseTo(actual, expected);
    });

    it("should convert #ffffffff (White) to HSVA", () => {
        const expected = createHsvaColor(0, 0, 1, 1);
        const actual = hexaToHsva("#ffffffff");
        expectHsvaToBeCloseTo(actual, expected);
    });

    it("should convert #000000ff (Black) to HSVA", () => {
        const expected = createHsvaColor(0, 0, 0, 1);
        const actual = hexaToHsva("#000000ff");
        expectHsvaToBeCloseTo(actual, expected);
    });

    it("should convert #368564 to HSVA", () => {
        const expected = createHsvaColor(155, 0.59, 0.52, 1);
        const actual = hexaToHsva("#368564");
        expectHsvaToBeCloseTo(actual, expected, 0.1);
    });

    it("should return null for an invalid hex string", () => {
        expect(hexaToHsva("invalid")).toBeNull();
        expect(hexaToHsva("#123456789")).toBeNull(); // Too long
    });
});

function expectHsvaToBeCloseTo(actual: HsvaColor | null, expected: HsvaColor, tolerance: number = 4) {
    if (!actual) {
        throw new Error("Actual HSVA value is null");
    }
    if (actual.saturation > 0 || actual.value > 0) {
        expect(actual.hue).toBeCloseTo(expected.hue, tolerance);
    }
    expect(actual.saturation).toBeCloseTo(expected.saturation, tolerance);
    expect(actual.value).toBeCloseTo(expected.value, tolerance);
    expect(actual.alpha).toBeCloseTo(expected.alpha, tolerance);
}