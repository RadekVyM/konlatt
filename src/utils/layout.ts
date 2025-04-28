import { Point } from "../types/Point";

export function getConcept2DPoint(
    layoutPoint: Point,
    diagramOffset: Point,
    scale: number,
    centerX: number,
    centerY: number,
    additionX: number = 0,
    additionY: number = 0,
): [number, number, number, number] {
    const normalX = layoutPoint[0] + diagramOffset[0] + additionX;
    const normalY = layoutPoint[1] + diagramOffset[1] + additionY;
    const x = (normalX * scale) + centerX;
    const y = (normalY * scale) + centerY;

    return [x, y, normalX, normalY];
}