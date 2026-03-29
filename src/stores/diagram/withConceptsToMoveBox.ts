import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";
import { calculateLayoutBox } from "./utils";
import withDragOffsetSnapping from "./withDragOffsetSnapping";

/**
 * Calculates the bounding box for concepts currently being moved within the diagram.
 * It ensures the `conceptsToMoveBox` state is kept in sync whenever layout, 
 * offsets, or selection indexes change, while wrapping the result with drag-snapping logic.
 */
export default function withConceptsToMoveBox(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const layout = withFallback(newState.layout, oldState.layout);
    const diagramOffsets = withFallback(newState.diagramOffsets, oldState.diagramOffsets);
    const conceptsToMoveIndexes = withFallback(newState.conceptsToMoveIndexes, oldState.conceptsToMoveIndexes);
    const conceptToLayoutIndexesMapping = withFallback(newState.conceptToLayoutIndexesMapping, oldState.conceptToLayoutIndexesMapping);
    const cameraType = withFallback(newState.cameraType, oldState.cameraType);
    const horizontalScale = withFallback(newState.horizontalScale, oldState.horizontalScale);
    const verticalScale = withFallback(newState.verticalScale, oldState.verticalScale);
    const rotationDegrees = withFallback(newState.rotationDegrees, oldState.rotationDegrees);

    if (!layout || !diagramOffsets || layout.length !== conceptToLayoutIndexesMapping.size) {
        return withDragOffsetSnapping({ ...newState, conceptsToMoveBox: null }, oldState);
    }

    const conceptsToMoveBox = calculateLayoutBox(
        conceptsToMoveIndexes,
        layout,
        diagramOffsets,
        conceptToLayoutIndexesMapping,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees);

    return withDragOffsetSnapping({
        ...newState,
        conceptsToMoveBox,
    }, oldState);
}