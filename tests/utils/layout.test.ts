import { describe, it, expect } from "vitest";
import { transformedPoint, rotatePoint, layoutRect } from "../../src/utils/layout";
import { createPoint, Point } from "../../src/types/Point";

describe("transformedPoint()", () => {
    const noDrag = createPoint(0, 0, 0);
    const noOffset = createPoint(0, 0, 0);

    describe("Scaling and Offsets", () => {
        it("should apply horizontal and vertical scaling", () => {
            const point = createPoint(10, 20, 10);
            const result = transformedPoint(point, noOffset, noDrag, 2, 0.5, 0, "3d");

            expect(result[0]).toBe(20);
            expect(result[1]).toBe(10);.5
            expect(result[2]).toBe(20);
        });

        it("should combine point offset and drag offset", () => {
            const point = createPoint(0, 0, 0);
            const offset = createPoint(10, 10, 10);
            const drag = createPoint(5, -5, 5);

            const result = transformedPoint(point, offset, drag, 1, 1, 0, "3d");

            expect(result[0]).toBe(15);
            expect(result[1]).toBe(5);
            expect(result[2]).toBe(15);
        });
    });

    describe("Rotation Logic (XZ Plane)", () => {
        it("should rotate 90 degrees", () => {
            const point = createPoint(10, 0, 0);
            // at 90 deg: X becomes 0, Z becomes -10
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 90, "3d");

            expect(result[0]).toBeCloseTo(0);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-10);
        });

        it("should rotate 180 degrees", () => {
            const point = createPoint(10, 0, 5);
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 180, "3d");

            expect(result[0]).toBeCloseTo(-10);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-5);
        });

        it("should rotate 45 degrees", () => {
            const point = createPoint(10, 0, 0);
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 45, "3d");

            expect(result[0]).toBeCloseTo(7.0710678118654755);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-7.0710678118654755);
        });

        it("should rotate 120 degrees", () => {
            const point = createPoint(10, 0, 0);
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 120, "3d");

            expect(result[0]).toBeCloseTo(-4.999999999999998);
            expect(result[1]).toBeCloseTo(0);
            expect(result[2]).toBeCloseTo(-8.660254037844387);
        });
    });

    describe("Camera and Z-Axis Behavior", () => {
        it("should flatten Z to 0 in '2d' mode but still apply zOffset", () => {
            const point = createPoint(10, 10, 50);
            const zOffset = 5;
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 0, "2d", zOffset);

            expect(result[2]).toBe(5);
        });

        it("should preserve Z in '3d' mode and add zOffset", () => {
            const point = createPoint(0, 0, 10);
            const zOffset = 5;
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 0, "3d", zOffset);

            expect(result[2]).toBe(15);
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero scales without crashing", () => {
            const point = createPoint(10, 10, 10);
            const result = transformedPoint(point, noOffset, noDrag, 0, 0, 0, "3d");

            expect(result).toEqual([0, 0, 0]);
        });

        it("should return correct Y even if rotation is applied", () => {
            const point = createPoint(0, 50, 0);
            const result = transformedPoint(point, noOffset, noDrag, 1, 1, 45, "3d");

            expect(result[1]).toBe(50); // Y remains unchanged
        });
    });
});

describe("rotatePoint()", () => {
    it("should rotate a point 180 degrees on the XZ plane", () => {
        const point = createPoint(10, 5, 0);
        const result = rotatePoint(point, 180);

        // cos(180) = -1, sin(180) = 0
        expect(result[0]).toBeCloseTo(-10);
        expect(result[1]).toBe(5); // Y remains unchanged
        expect(result[2]).toBeCloseTo(0);
    });
});

describe("layoutRect()", () => {
    it("should calculate correct bounding box dimensions", () => {
        const layout = new Array<Point>(
            createPoint(0, 10, 0),
            createPoint(50, -10, 0),
            createPoint(25, 0, 0));

        const rect = layoutRect(layout);

        expect(rect).toEqual({
            left: 0,
            right: 50,
            top: 10,
            bottom: -10,
            width: 50,
            height: 20
        });
    });

    it("should handle a single point", () => {
        const rect = layoutRect([createPoint(5, 5, 5)]);
        expect(rect.width).toBe(0);
        expect(rect.height).toBe(0);
        expect(rect.left).toBe(5);
    });
});