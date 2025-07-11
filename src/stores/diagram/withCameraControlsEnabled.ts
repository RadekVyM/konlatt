import { DiagramStore } from "./useDiagramStore";

export default function withCameraControlsEnabled(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const isDraggingNodes = newState.isDraggingNodes !== undefined ? newState.isDraggingNodes : oldState.isDraggingNodes;
    const multiselectEnabled = newState.multiselectEnabled !== undefined ? newState.multiselectEnabled : oldState.multiselectEnabled;

    return {
        ...newState,
        cameraControlsEnabled: !isDraggingNodes && !multiselectEnabled,
    };
}