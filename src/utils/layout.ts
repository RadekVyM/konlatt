import { ConceptPoint } from "../types/ConceptPoint";
import { Point } from "../types/Point";

export function getConcept2DPoint(
    layoutPoint: ConceptPoint,
    diagramOffset: Point,
    scale: number,
    centerX: number,
    centerY: number,
    additionX: number = 0,
    additionY: number = 0,
): [number, number, number, number, number] {
    const normalX = layoutPoint.x + diagramOffset[0] + additionX;
    const normalY = layoutPoint.y + diagramOffset[1] + additionY;
    const x = (normalX * scale) + centerX;
    const y = (normalY * scale) + centerY;

    return [x, y, normalX, normalY, layoutPoint.conceptIndex];
}