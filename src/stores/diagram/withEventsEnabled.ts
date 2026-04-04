import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";

/**
 * Calculates and updates the `eventsEnabled` state.
 */
export default function withEventsEnabled(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore
): Partial<DiagramStore> {
    const isDraggingNodes = withFallback(newState.isDraggingNodes, oldState.isDraggingNodes);
    const isCameraMoving = withFallback(newState.isCameraMoving, oldState.isCameraMoving);

    return {
        ...newState,
        eventsEnabled: !isCameraMoving && !isDraggingNodes,
    };
}