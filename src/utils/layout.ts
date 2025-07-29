import { X_SCALE, Y_SCALE, Z_SCALE } from "../constants/diagram";
import { CameraType } from "../types/CameraType";
import { Point } from "../types/Point";

export function transformedPoint(
    point: Point,
    offset: Point,
    dragOffset: Point,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    zOffset: number = 0,
): Point {
    return [
        ((point[0] * horizontalScale) + offset[0] + dragOffset[0]) * X_SCALE,
        ((point[1] * verticalScale) + offset[1] + dragOffset[1]) * Y_SCALE,
        (cameraType === "2d" ? 0 : ((point[2] * horizontalScale) + offset[2] + dragOffset[2]) * Z_SCALE) + zOffset,
    ];
}