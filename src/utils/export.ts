import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { createPoint, Point } from "../types/Point";
import { transformedPoint } from "./layout";

export function transformedLayoutForExport(
    layout: ConceptLatticeLayout | null,
    diagramOffsets: Array<Point> | null,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) {
    if (!layout || !diagramOffsets) {
        return null;
    }

    return layout.map((point, i) => transformedPoint(
        createPoint(point.x, point.y, point.z),
        diagramOffsets[i],
        [0, 0, 0],
        horizontalScale,
        verticalScale,
        rotationDegrees,
        "2d"));
}

export function layoutRect(layout: Array<Point>) {
    let left = Number.MAX_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    let top = Number.MAX_SAFE_INTEGER;
    let bottom = Number.MIN_SAFE_INTEGER;

    for (const point of layout) {
        left = Math.min(left, point[0]);
        right = Math.max(right, point[0]);
        top = Math.min(top, point[1]);
        bottom = Math.max(bottom, point[1]);
    }

    const width = right - left;
    const height = bottom - top;

    return {
        left,
        right,
        top,
        bottom,
        width,
        height,
    };
}