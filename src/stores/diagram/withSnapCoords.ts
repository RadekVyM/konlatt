import { DiagramStore } from "./useDiagramStore";

export default function withSnapCoords(newState: Partial<DiagramStore>, oldState: DiagramStore) {
    // TODO: calculate snap coords
    // @ts-ignore
    const dragOffset = newState.dragOffset === undefined ? oldState.dragOffset : newState.dragOffset;

    return { ...newState };
}