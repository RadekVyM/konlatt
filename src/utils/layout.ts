import { X_SCALE, Y_SCALE, Z_SCALE } from "../constants/canvas-drawing";
import { CameraType } from "../types/diagram/CameraType";
import { createPoint, Point } from "../types/Point";
import { degreesToRadians } from "./numbers";

export function transformedPoint(
    point: Point,
    offset: Point,
    dragOffset: Point,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    cameraType: CameraType,
    zOffset: number = 0,
): Point {
    const idealX = (point[0] * horizontalScale) + offset[0];
    const idealZ = (point[2] * horizontalScale) + offset[2];
    const rotationRadians = degreesToRadians(rotationDegrees);
    const x = (idealX * Math.cos(rotationRadians)) + (idealZ * Math.sin(rotationRadians));
    const z = (-idealX * Math.sin(rotationRadians)) + (idealZ * Math.cos(rotationRadians));

    return [
        (x + dragOffset[0]) * X_SCALE,
        ((point[1] * verticalScale) + offset[1] + dragOffset[1]) * Y_SCALE,
        (cameraType === "2d" ? 0 : (z + dragOffset[2]) * Z_SCALE) + zOffset,
    ];
}

export function rotatePoint(point: Point, rotationDegrees: number) {
    const rotationRadians = degreesToRadians(rotationDegrees);

    return createPoint(
        (point[0] * Math.cos(rotationRadians)) + (point[2] * Math.sin(rotationRadians)),
        point[1],
        (-point[0] * Math.sin(rotationRadians)) + (point[2] * Math.cos(rotationRadians)));
}

export function layoutRect(layout: Array<Point>) {
    let left = Number.MAX_SAFE_INTEGER;
    let right = Number.MIN_SAFE_INTEGER;
    let top = Number.MIN_SAFE_INTEGER;
    let bottom = Number.MAX_SAFE_INTEGER;

    for (const point of layout) {
        left = Math.min(left, point[0]);
        right = Math.max(right, point[0]);
        top = Math.max(top, point[1]);
        bottom = Math.min(bottom, point[1]);
    }

    const width = right - left;
    const height = top - bottom;

    return {
        left,
        right,
        top,
        bottom,
        width,
        height,
    };
}