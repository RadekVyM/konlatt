import { Box } from "../../types/Box";
import { CameraType } from "../../types/CameraType";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
import { createPoint, Point } from "../../types/Point";
import { transformedPoint } from "../../utils/layout";

export function createEmptyDiagramOffsetMementos() {
    return { redos: [], undos: [] };
}

export function createConceptLayoutIndexesMappings(layout: ConceptLatticeLayout | null) {
    const conceptToLayoutIndexesMapping = new Map<number, number>();
    const layoutToConceptIndexesMapping = new Map<number, number>();

    if (layout !== null) {
        for (let i = 0; i < layout.length; i++) {
            const point = layout[i];
            conceptToLayoutIndexesMapping.set(point.conceptIndex, i);
            layoutToConceptIndexesMapping.set(i, point.conceptIndex);
        }
    }

    return {
        conceptToLayoutIndexesMapping,
        layoutToConceptIndexesMapping,
    };
}

export function createDiagramLayoutStateId(state: DiagramLayoutState) {
    const start = state.displayHighlightedSublatticeOnly ?
        `${state.lowerConeOnlyConceptIndex};${state.upperConeOnlyConceptIndex}` :
        "null;null";

    let layoutMethodSegment = "";

    switch (state.layoutMethod) {
        case "layered":
            layoutMethodSegment = `${state.placementLayered}`;
            break;
        case "freese":
            layoutMethodSegment = ``;
            break;
        case "redraw":
            layoutMethodSegment = `${state.targetDimensionReDraw}-${state.parallelizeReDraw}-${state.seedReDraw}`;
            break;
    }

    return `${start}-${state.layoutMethod}-${state.layoutMethod}-${layoutMethodSegment}`;
}

export function createDefaultDiagramOffsets(length: number) {
    const offsets = new Array<Point>(length);

    for (let i = 0; i < length; i++) {
        offsets[i] = createPoint(0, 0, 0);
    }

    return offsets;
}

export function calculateLayoutBox(
    conceptIndexes: Iterable<number>,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
) : Box | null {
    const nullOffset = createPoint(0, 0, 0);

    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let minZ = Number.MAX_SAFE_INTEGER;
    let maxZ = Number.MIN_SAFE_INTEGER;

    for (const conceptIndex of conceptIndexes) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

        if (layoutIndex === undefined) {
            console.error(`Layout index should not be ${layoutIndex}`);
            continue;
        }

        const conceptPoint = layout[layoutIndex];
        const offset = diagramOffsets[layoutIndex];

        const point = transformedPoint(createPoint(conceptPoint.x, conceptPoint.y, conceptPoint.z), offset, nullOffset, horizontalScale, verticalScale, rotationDegrees, cameraType);

        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
        minZ = Math.min(minZ, point[2]);
        maxZ = Math.max(maxZ, point[2]);
    }

    if (minX === Number.MAX_SAFE_INTEGER || maxX === Number.MIN_SAFE_INTEGER ||
        minY === Number.MAX_SAFE_INTEGER || maxY === Number.MIN_SAFE_INTEGER ||
        minZ === Number.MAX_SAFE_INTEGER || maxZ === Number.MIN_SAFE_INTEGER) {
        return null;
    }

    const box: Box = {
        x: minX,
        y: minY,
        z: minZ,
        width: maxX - minX,
        height: maxY - minY,
        depth: maxZ - minZ,
    };

    return box;
}