import { transformedPoint } from "../../components/concepts/diagram/utils";
import { createPoint } from "../../types/Point";
import { DiagramStore } from "./useDiagramStore";
import withSnapCoords from "./withSnapCoords";

export default function withConceptsToMoveBox(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const layout = newState.layout === undefined ? oldState.layout : newState.layout;
    const diagramOffsets = newState.diagramOffsets === undefined ? oldState.diagramOffsets : newState.diagramOffsets;
    const conceptsToMoveIndexes = newState.conceptsToMoveIndexes === undefined ? oldState.conceptsToMoveIndexes : newState.conceptsToMoveIndexes;
    const conceptToLayoutIndexesMapping = newState.conceptToLayoutIndexesMapping === undefined ? oldState.conceptToLayoutIndexesMapping : newState.conceptToLayoutIndexesMapping;
    const cameraType = newState.cameraType === undefined ? oldState.cameraType : newState.cameraType;

    const nullOffset = createPoint(0, 0, 0);

    if (!layout || !diagramOffsets || layout.length !== conceptToLayoutIndexesMapping.size) {
        return withSnapCoords({ ...newState, conceptsToMoveBox: null }, oldState);
    }

    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;
    let minZ = Number.MAX_SAFE_INTEGER;
    let maxZ = Number.MIN_SAFE_INTEGER;

    for (const conceptIndex of conceptsToMoveIndexes) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

        if (layoutIndex === undefined) {
            console.error(`Layout index should not be ${layoutIndex}`);
            continue;
        }

        const conceptPoint = layout[layoutIndex];
        const offset = diagramOffsets[layoutIndex];

        const point = transformedPoint(createPoint(conceptPoint.x, conceptPoint.y, conceptPoint.z), offset, nullOffset, cameraType);

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
        return withSnapCoords({ ...newState, conceptsToMoveBox: null }, oldState);
    }

    const conceptsToMoveBox = {
        x: minX,
        y: minY,
        z: minZ,
        width: maxX - minX,
        height: maxY - minY,
        depth: maxZ - minZ,
    };

    return withSnapCoords({
        ...newState,
        conceptsToMoveBox,
    }, oldState);
}