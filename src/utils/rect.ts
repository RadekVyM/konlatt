import { Rect } from "../types/Rect";

/**
 * Checks if a point (x, y) is contained within the bounds of a rectangle.
 */
export function isInRect(x: number, y: number, rect: Rect) {
    return x >= rect.x && x <= rect.x + rect.width && 
        y >= rect.y && y <= rect.y + rect.height
}

/**
 * Determines if a line segment between two points intersects or is contained within a rectangle.
 * It checks if either endpoint is inside the rect, or if the segment crosses any of the four edges.
 */
export function crossesRect(firstX: number, firstY: number, secondX: number, secondY: number, rect: Rect) {
    if (isInRect(firstX, firstY, rect) || isInRect(secondX, secondY, rect)) {
        return true;
    }

    const left = rect.x;
    const top = rect.y;
    const right = left + rect.width;
    const bottom = top + rect.height;

    return lineSegmentIntersection(firstX, firstY, secondX, secondY, left, top, left, bottom) ||
        lineSegmentIntersection(firstX, firstY, secondX, secondY, right, top, right, bottom) ||
        lineSegmentIntersection(firstX, firstY, secondX, secondY, left, top, right, top) ||
        lineSegmentIntersection(firstX, firstY, secondX, secondY, left, bottom, right, bottom);
}

function lineSegmentIntersection(
    firstStartX: number,
    firstStartY: number,
    firstEndX: number,
    firstEndY: number,
    secondStartX: number,
    secondStartY: number,
    secondEndX: number,
    secondEndY: number,
) {
    const denominator = (secondEndY - secondStartY) * (firstEndX - firstStartX) - (secondEndX - secondStartX) * (firstEndY - firstStartY);

    // Lines are parallel
    if (denominator === 0) {
        return false;
    }

    const ua = ((secondEndX - secondStartX) * (firstStartY - secondStartY) - (secondEndY - secondStartY) * (firstStartX - secondStartX)) / denominator;
    const ub = ((firstEndX - firstStartX) * (firstStartY - secondStartY) - (firstEndY - firstStartY) * (firstStartX - secondStartX)) / denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}