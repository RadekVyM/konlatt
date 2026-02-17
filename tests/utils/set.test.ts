import { describe, it, expect } from "vitest";
import { areSetsEqual, areArraySetEqual } from "../../src/utils/set";

describe("areSetsEqual()", () => {
    it("should return true for identical sets", () => {
        const setA = new Set([1, 2, 3]);
        const setB = new Set([3, 2, 1]);
        expect(areSetsEqual(setA, setB)).toBe(true);
    });

    it("should return false for sets of different sizes", () => {
        const setA = new Set([1, 2]);
        const setB = new Set([1, 2, 3]);
        expect(areSetsEqual(setA, setB)).toBe(false);
    });

    it("should return false for sets with same size but different values", () => {
        const setA = new Set([1, 2, 3]);
        const setB = new Set([1, 2, 4]);
        expect(areSetsEqual(setA, setB)).toBe(false);
    });

    it("should return true for two empty sets", () => {
        expect(areSetsEqual(new Set(), new Set())).toBe(true);
    });
});

describe("areArraySetEqual()", () => {
    it("should return true when elements match regardless of array order", () => {
        const arr = ["a", "b", "c"];
        const set = new Set(["c", "a", "b"]);
        expect(areArraySetEqual(arr, set)).toBe(true);
    });

    it("should return false when sizes differ", () => {
        const arr = [1, 2];
        const set = new Set([1, 2, 3]);
        expect(areArraySetEqual(arr, set)).toBe(false);
    });

    it("should work with object references", () => {
        const obj = { id: 1 };
        const arr = [obj];
        const set = new Set([obj]);
        expect(areArraySetEqual(arr, set)).toBe(true);
    });
});