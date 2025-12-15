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

export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function outlineWidth(textSize: number) {
    return textSize / 5;
}