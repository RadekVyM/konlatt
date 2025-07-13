import { DiagramStore } from "./useDiagramStore";
import { calculateLayoutBox } from "./utils";
import withDragOffsetSnapping from "./withDragOffsetSnapping";

export default function withConceptsToMoveBox(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const layout = newState.layout === undefined ? oldState.layout : newState.layout;
    const diagramOffsets = newState.diagramOffsets === undefined ? oldState.diagramOffsets : newState.diagramOffsets;
    const conceptsToMoveIndexes = newState.conceptsToMoveIndexes === undefined ? oldState.conceptsToMoveIndexes : newState.conceptsToMoveIndexes;
    const conceptToLayoutIndexesMapping = newState.conceptToLayoutIndexesMapping === undefined ? oldState.conceptToLayoutIndexesMapping : newState.conceptToLayoutIndexesMapping;
    const cameraType = newState.cameraType === undefined ? oldState.cameraType : newState.cameraType;

    if (!layout || !diagramOffsets || layout.length !== conceptToLayoutIndexesMapping.size) {
        return withDragOffsetSnapping({ ...newState, conceptsToMoveBox: null }, oldState);
    }

    const conceptsToMoveBox = calculateLayoutBox(conceptsToMoveIndexes, layout, diagramOffsets, conceptToLayoutIndexesMapping, cameraType);

    return withDragOffsetSnapping({
        ...newState,
        conceptsToMoveBox,
    }, oldState);
}