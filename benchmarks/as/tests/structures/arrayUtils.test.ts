import { expect, test } from "vitest";
import { __collect, isSortedSubsetOfTest } from "../..";

test("isSortedSubsetOfTest", () => {
    expect(isSortedSubsetOfTest([], [0, 1, 2, 3])).toBe(true);
    expect(isSortedSubsetOfTest([0, 1], [0, 1, 2, 3])).toBe(true);
    expect(isSortedSubsetOfTest([1, 2], [0, 1, 2, 3])).toBe(true);
    expect(isSortedSubsetOfTest([0, 3], [0, 1, 2, 3])).toBe(true);
    expect(isSortedSubsetOfTest([0, 1, 2, 3], [0, 1, 2, 3])).toBe(true);
    expect(isSortedSubsetOfTest([0, 1, 2, 3], [1, 2, 3])).toBe(false);
    expect(isSortedSubsetOfTest([0, 1, 2, 3], [0, 1, 6, 7])).toBe(false);
    expect(isSortedSubsetOfTest([0, 1, 2, 3], [4, 5, 6, 7])).toBe(false);
    expect(isSortedSubsetOfTest([0, 1, 2, 3], [])).toBe(false);
    __collect();
});