import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";

/**
 * Calculates and updates the `cameraControlsEnabled` state.
 * Camera controls are disabled if the user is currently performing an action 
 * that conflicts with camera movement, such as dragging nodes or using multiselect.
 */
export default function withCameraControlsEnabled(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore
): Partial<DiagramStore> {
    const isDraggingNodes = withFallback(newState.isDraggingNodes, oldState.isDraggingNodes);
    const multiselectEnabled = withFallback(newState.multiselectEnabled, oldState.multiselectEnabled);

    return {
        ...newState,
        cameraControlsEnabled: !isDraggingNodes && !multiselectEnabled,
    };
}