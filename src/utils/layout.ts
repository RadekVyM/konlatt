import { X_SCALE, Y_SCALE, Z_SCALE } from "../constants/diagram";
import { CameraType } from "../types/CameraType";
import { Point } from "../types/Point";
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
    const idealX = point[0];
    const idealZ = point[2];
    const rotationRadians = degreesToRadians(rotationDegrees);
    const x = (idealX * Math.cos(rotationRadians)) + (idealZ * Math.sin(rotationRadians));
    const z = (-idealX * Math.sin(rotationRadians)) + (idealZ * Math.cos(rotationRadians));

    return [
        ((x * horizontalScale) + offset[0] + dragOffset[0]) * X_SCALE,
        ((point[1] * verticalScale) + offset[1] + dragOffset[1]) * Y_SCALE,
        (cameraType === "2d" ? 0 : ((z * horizontalScale) + offset[2] + dragOffset[2]) * Z_SCALE) + zOffset,
    ];
}