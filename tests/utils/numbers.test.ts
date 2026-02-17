import { describe, it, expect } from "vitest";
import { degreesToRadians, formatBytes, formatTimeInterval } from "../../src/utils/numbers";

describe("degreesToRadians()", () => {
    it("converts common angles correctly", () => {
        expect(degreesToRadians(0)).toBe(0);
        expect(degreesToRadians(180)).toBe(Math.PI);
        expect(degreesToRadians(90)).toBe(Math.PI / 2);
        expect(degreesToRadians(60)).toBe(Math.PI / 3);
        expect(degreesToRadians(120)).toBe(2 * (Math.PI / 3));
    });

    it("handles negative angles", () => {
        expect(degreesToRadians(-180)).toBe(-Math.PI);
    });
});

describe("formatBytes()", () => {
    it("formats zero bytes correctly", () => {
        expect(formatBytes(0, "en")).toMatch(/0\s?B/);
    });

    it("scales to kilobytes and megabytes", () => {
        expect(formatBytes(1000, "en")).toMatch(/1\s?kB/);
        expect(formatBytes(1500000, "en")).toMatch(/1.5\s?MB/);
    });

    it("limits fraction digits to 2", () => {
        expect(formatBytes(1234567, "en")).toMatch(/1.23\s?MB/);
    });
});

describe("formatTimeInterval()", () => {
    it("returns undefined for negative input", () => {
        expect(formatTimeInterval(-1)).toBeUndefined();
    });

    it("formats milliseconds when less than a second", () => {
        expect(formatTimeInterval(500)).toBe("500ms");
    });

    it("combines days, hours, minutes, and seconds", () => {
        const oneDayInMs = 24 * 60 * 60 * 1000;
        const oneHourInMs = 60 * 60 * 1000;

        expect(formatTimeInterval(oneDayInMs + oneHourInMs + 61000)).toBe("1d 1h 1m 1s");
    });

    it("skips units with zero values", () => {
        const twoHoursInMs = 2 * 60 * 60 * 1000;
        expect(formatTimeInterval(twoHoursInMs + 500)).toBe("2h");
    });
});