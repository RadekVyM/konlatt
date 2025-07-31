import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLatticeLayoutCacheItem } from "../../types/ConceptLatticeLayoutCacheItem";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
import { DiagramOffsetMementos } from "../../types/DiagramOffsetMementos";
import { createNodeOffsetMemento } from "../../types/NodeOffsetMemento";
import { createPoint, Point } from "../../types/Point";
import { rotatePoint } from "../../utils/layout";
import { w } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";
import { createConceptLayoutIndexesMappings, createDefaultDiagramOffsets, createDiagramLayoutStateId, createEmptyDiagramOffsetMementos } from "./utils";
import withConceptsToMoveBox from "./withConceptsToMoveBox";
import withDefaultLayoutBox from "./withDefaultLayoutBox";

type DiagramLayoutSliceState = {
    layout: ConceptLatticeLayout | null,
    layoutId: string,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutToConceptIndexesMapping: Map<number, number>,
    layoutCache: Map<string, ConceptLatticeLayoutCacheItem>,
    currentLayoutJobId: number | null,
    currentLayoutJobStateId: string | null,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    canUndo: boolean,
    canRedo: boolean,
}

type DiagramLayoutSliceActions = {
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setCurrentLayoutJobId: (currentLayoutJobId: number | null, layoutState: DiagramLayoutState | null) => void,
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
    updateNodeOffsets: (conceptIndexes: Iterable<number>, offset: Point) => void,
    undo: () => void,
    redo: () => void,
}

export type DiagramLayoutSlice = DiagramLayoutSliceState & DiagramLayoutSliceActions

export const initialState: DiagramLayoutSliceState = {
    layout: null,
    layoutId: "",
    layoutCache: new Map(),
    conceptToLayoutIndexesMapping: new Map(),
    layoutToConceptIndexesMapping: new Map(),
    currentLayoutJobId: null,
    currentLayoutJobStateId: null,
    diagramOffsets: null,
    diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
    canUndo: false,
    canRedo: false,
};

export default function createDiagramLayoutSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramLayoutSlice {
    return {
        ...initialState,
        setLayout: (layout) => set((old) => {
            const diagramOffsets = layout ? createDefaultDiagramOffsets(layout.length) : null;
            const diagramOffsetMementos = createEmptyDiagramOffsetMementos();

            return w({
                layout,
                layoutId: `${layout?.length}-${Math.random()}`,
                ...createConceptLayoutIndexesMappings(layout),
                diagramOffsets,
                diagramOffsetMementos,
                layoutCache: layout && diagramOffsets ?
                    updateLayoutCache(
                        old.layoutCache,
                        layout,
                        diagramOffsets,
                        diagramOffsetMementos,
                        old) :
                    new Map(),
                conceptsToMoveIndexes: new Set(),
                currentZoomLevel: 1,
            }, old, withConceptsToMoveBox, withDefaultLayoutBox);
        }),
        setCurrentLayoutJobId: (currentLayoutJobId, layoutState) => set(() => ({
            currentLayoutJobId,
            currentLayoutJobStateId: layoutState === null ? null : createDiagramLayoutStateId(layoutState),
        })),
        setDiagramOffsets: (diagramOffsets) => set((old) => withDiagramOffsets({ diagramOffsets }, old)),
        setDiagramOffsetMementos: (diagramOffsetMementos) => set((old) => withDiagramOffsetMementos({ diagramOffsetMementos }, old)),
        updateNodeOffsets: (conceptIndexes, offset) => set((old) => {
            const diagramOffsets = old.diagramOffsets;
            const conceptToLayoutIndexesMapping = old.conceptToLayoutIndexesMapping;
            const rotationDegrees = old.rotationDegrees;

            if (!diagramOffsets || !conceptToLayoutIndexesMapping) {
                return {};
            }

            const layoutIndexes = new Array<number>();
            for (const conceptIndex of conceptIndexes) {
                const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

                if (layoutIndex === undefined) {
                    console.error(`Layout index should not be ${layoutIndex}`);
                    continue;
                }

                layoutIndexes.push(layoutIndex);   
            }

            offset = rotatePoint(offset, -rotationDegrees);
            const newOffsets = [...diagramOffsets];
            applyOffset(newOffsets, layoutIndexes, offset);

            return w({
                diagramOffsets: newOffsets,
                diagramOffsetMementos: {
                    redos: [], undos: [...old.diagramOffsetMementos.undos, createNodeOffsetMemento(layoutIndexes, offset)],
                },
            }, old, withDiagramOffsets, withDiagramOffsetMementos);
        }),
        undo: () => set((old) => {
            const diagramOffsets = old.diagramOffsets;
            const undos = old.diagramOffsetMementos.undos;
            const redos = old.diagramOffsetMementos.redos;

            if (undos.length === 0 || !diagramOffsets) {
                return {};
            }

            const memento = undos[undos.length - 1];
            const newOffsets = [...diagramOffsets];

            applyOffset(newOffsets, memento.nodes, memento.offset, -1);

            return w({
                diagramOffsets: newOffsets,
                diagramOffsetMementos: {
                    undos: undos.slice(0, undos.length - 1),
                    redos: [...redos, memento],
                },
            }, old, withDiagramOffsets, withDiagramOffsetMementos);
        }),
        redo: () => set((old) => {
            const diagramOffsets = old.diagramOffsets;
            const undos = old.diagramOffsetMementos.undos;
            const redos = old.diagramOffsetMementos.redos;

            if (redos.length === 0 || !diagramOffsets) {
                return {};
            }

            const memento = redos[redos.length - 1];
            const newOffsets = [...diagramOffsets];

            applyOffset(newOffsets, memento.nodes, memento.offset);

            return w({
                diagramOffsets: newOffsets,
                diagramOffsetMementos: {
                    redos: redos.slice(0, redos.length - 1),
                    undos: [...undos, memento],
                },
            }, old, withDiagramOffsets, withDiagramOffsetMementos);
        }),
    };
}

function withDiagramOffsets(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore,
): Partial<DiagramStore> {
    const diagramOffsets = newState.diagramOffsets !== undefined ? newState.diagramOffsets : oldState.diagramOffsets;
    const stateId = createDiagramLayoutStateId(oldState);
    const cacheItem = oldState.layoutCache.get(stateId);

    if (cacheItem && diagramOffsets) {
        cacheItem.diagramOffsets = diagramOffsets;
    }

    return withConceptsToMoveBox({ ...newState, diagramOffsets }, oldState);
}

function withDiagramOffsetMementos(
    newState: Partial<DiagramStore>,
    oldState: DiagramStore,
): Partial<DiagramStore> {
    const diagramOffsetMementos = newState.diagramOffsetMementos !== undefined ? newState.diagramOffsetMementos : oldState.diagramOffsetMementos;
    const stateId = createDiagramLayoutStateId(oldState);
    const cacheItem = oldState.layoutCache.get(stateId);

    if (cacheItem && diagramOffsetMementos) {
        cacheItem.diagramOffsetMementos = diagramOffsetMementos;
    }

    return {
        ...newState,
        diagramOffsetMementos,
        canUndo: diagramOffsetMementos.undos.length > 0,
        canRedo: diagramOffsetMementos.redos.length > 0,
    };
}

function updateLayoutCache(
    layoutCache: Map<string, ConceptLatticeLayoutCacheItem>,
    newLayout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    diagramOffsetMementos: DiagramOffsetMementos,
    layoutState: DiagramLayoutState,
): Map<string, ConceptLatticeLayoutCacheItem> {
    const stateId = createDiagramLayoutStateId(layoutState);
    const newCache = new Map<string, ConceptLatticeLayoutCacheItem>(layoutCache);
    newCache.set(stateId, { layout: newLayout, stateId, diagramOffsetMementos, diagramOffsets });

    return newCache;
}

function applyOffset(offsets: Array<Point>, nodes: Array<number>, offset: Point, factor: number = 1) {
    for (const node of nodes) {
        const currentValue = offsets[node];
        offsets[node] = createPoint(
            currentValue[0] + (offset[0] * factor),
            currentValue[1] + (offset[1] * factor),
            currentValue[2] + (offset[2] * factor),
        );
    }
}