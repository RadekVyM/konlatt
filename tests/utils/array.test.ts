import { describe, it, expect } from "vitest";
import { createRange, fillWith, sumLengths } from "../../src/utils/array";

describe("createRange()", () => {
    it("should create an array of specified length with incremental numbers", () => {
        const result = createRange(3);
        expect(result).toEqual([0, 1, 2]);
        expect(result).toHaveLength(3);
    });

    it("should return an empty array when length is 0", () => {
        expect(createRange(0)).toEqual([]);
    });
});

describe("fillWith()", () => {
    it("should mutate the array by filling it with a specific value", () => {
        const input = [1, 2, 3];
        fillWith(input, 9);
        expect(input).toEqual([9, 9, 9]);
    });

    it("should work with different types using generics", () => {
        const input = ["a", "b"];
        fillWith(input, "z");
        expect(input).toEqual(["z", "z"]);
    });
});

describe("sumLengths()", () => {
    it("should calculate total length of strings without addition", () => {
        const result = sumLengths(["hi", "there"]);
        expect(result).toBe(7);
    });

    it("should apply the addition value to every element", () => {
        const result = sumLengths(["hi", "mom"], 1);
        expect(result).toBe(7);
    });

    it("should return 0 for an empty array", () => {
        expect(sumLengths([], 10)).toBe(0);
    });
});