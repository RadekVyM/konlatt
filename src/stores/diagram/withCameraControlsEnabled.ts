import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";

export default function withCameraControlsEnabled(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const isDraggingNodes = withFallback(newState.isDraggingNodes, oldState.isDraggingNodes);
    const multiselectEnabled = withFallback(newState.multiselectEnabled, oldState.multiselectEnabled);

    return {
        ...newState,
        cameraControlsEnabled: !isDraggingNodes && !multiselectEnabled,
    };
}