import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";

/**
 * Computes the availability of undo and redo actions based on the memento history.
 */
export function withCanUndoRedo(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore,
): Partial<DiagramStore> {
    const diagramOffsetMementos = withFallback(newState.diagramOffsetMementos, oldState.diagramOffsetMementos);

    return {
        ...newState,
        canUndo: diagramOffsetMementos.undos.length > 0,
        canRedo: diagramOffsetMementos.redos.length > 0,
    };
}