import { createNodeOffsetMemento, NodeOffsetMemento } from "../types/NodeOffsetMemento";
import { createPoint, Point } from "../types/Point";
import useDiagramStore from "../stores/useDiagramStore";

export function useDiagramOffsets() {
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const conceptToLayoutIndexesMapping = useDiagramStore((state) => state.conceptToLayoutIndexesMapping);
    const { redos, undos } = useDiagramStore((state) => state.diagramOffsetMementos);
    const setDiagramOffsets = useDiagramStore((state) => state.setDiagramOffsets);
    const setDiagramOffsetMementos = useDiagramStore((state) => state.setDiagramOffsetMementos);

    function pushUndoMemento(memento: NodeOffsetMemento) {
        setDiagramOffsetMementos({ redos: [], undos: [...undos, memento] });
    }

    function undo() {
        if (undos.length === 0 || !diagramOffsets) {
            return;
        }

        const memento = undos[undos.length - 1];
        setDiagramOffsetMementos({
            undos: undos.slice(0, undos.length - 1),
            redos: [...redos, memento],
        });

        const newOffsets = [...diagramOffsets];

        for (const m of memento) {
            applyOffset(newOffsets, m.node, m.offset, -1);
        }

        setDiagramOffsets(newOffsets);
    }

    function redo() {
        if (redos.length === 0 || !diagramOffsets) {
            return;
        }

        const memento = redos[redos.length - 1];
        setDiagramOffsetMementos({
            redos: redos.slice(0, redos.length - 1),
            undos: [...undos, memento],
        });

        const newOffsets = [...diagramOffsets];

        for (const m of memento) {
            applyOffset(newOffsets, m.node, m.offset);
        }

        setDiagramOffsets(newOffsets);
    }

    function updateNodeOffset(conceptIndex: number, offset: Point) {
        if (!diagramOffsets || !conceptToLayoutIndexesMapping) {
            return;
        }

        const newOffsets = [...diagramOffsets];
        applyOffset(newOffsets, conceptToLayoutIndexesMapping.get(conceptIndex)!, offset);
        setDiagramOffsets(newOffsets);
        pushUndoMemento(createNodeOffsetMemento(conceptIndex, offset));
    }

    return {
        diagramOffsets,
        updateNodeOffset,
        undo,
        redo,
        canUndo: undos.length > 0,
        canRedo: redos.length > 0,
    };
}

function applyOffset(offsets: Array<Point>, node: number, offset: Point, factor: number = 1) {
    const currentValue = offsets[node];
    offsets[node] = createPoint(
        currentValue[0] + (offset[0] * factor),
        currentValue[1] + (offset[1] * factor),
        currentValue[2] + (offset[2] * factor),
    );
}