import { describe, it, expect } from "vitest";
import { isInRect, crossesRect } from "../../src/utils/rect";
import { Rect } from "../../src/types/Rect";

const rect: Rect = { x: 10, y: 10, width: 100, height: 100 };

describe("isInRect()", () => {
    it("returns true when point is inside", () => {
        expect(isInRect(50, 50, rect)).toBe(true);
    });

    it("returns true when point is on the edge", () => {
        expect(isInRect(10, 10, rect)).toBe(true);
        expect(isInRect(110, 110, rect)).toBe(true);
    });

    it("returns false when point is outside", () => {
        expect(isInRect(5, 5, rect)).toBe(false);
    });
});

describe("crossesRect()", () => {
    it("returns true if one point is inside", () => {
        // Line starts outside, ends inside
        expect(crossesRect(0, 0, 50, 50, rect)).toBe(true);
    });

    it("returns true if both points are inside", () => {
        expect(crossesRect(20, 20, 50, 50, rect)).toBe(true);
    });

    it("returns true if the line passes through the rectangle", () => {
        // Line cuts horizontally through the middle
        expect(crossesRect(0, 50, 200, 50, rect)).toBe(true);
    });

    it("returns true if the line segments intersect an edge", () => {
        // Line crosses only the top edge
        expect(crossesRect(50, 5, 50, 15, rect)).toBe(true);
    });

    it("returns false if the line is entirely outside", () => {
        expect(crossesRect(0, 0, 5, 5, rect)).toBe(false);
    });

    it("returns false if the line is parallel to but outside the rect", () => {
        expect(crossesRect(120, 0, 120, 200, rect)).toBe(false);
    });
});