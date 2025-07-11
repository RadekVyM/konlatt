import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLatticeLayoutCacheItem } from "../../types/ConceptLatticeLayoutCacheItem";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";
import { DiagramOffsetMementos } from "../../types/DiagramOffsetMementos";
import { createPoint, Point } from "../../types/Point";
import { DiagramStore } from "./useDiagramStore";
import { createConceptLayoutIndexesMappings, createDiagramLayoutStateId, createEmptyDiagramOffsetMementos } from "./utils";
import withConceptsToMoveBox from "./withConceptsToMoveBox";

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
}

type DiagramLayoutSliceActions = {
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setCurrentLayoutJobId: (currentLayoutJobId: number | null, layoutState: DiagramLayoutState | null) => void,
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
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
};

export default function createDiagramLayoutSlice(set: (partial: DiagramStore | Partial<DiagramStore> | ((state: DiagramStore) => DiagramStore | Partial<DiagramStore>), replace?: false) => void): DiagramLayoutSlice {
    return {
        ...initialState,
        setLayout: (layout) => set((old) => {
            const diagramOffsets = layout ? createDefaultDiagramOffsets(layout.length) : null;
            const diagramOffsetMementos = createEmptyDiagramOffsetMementos();

            return withConceptsToMoveBox({
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
            }, old);
        }),
        setCurrentLayoutJobId: (currentLayoutJobId, layoutState) => set(() => ({
            currentLayoutJobId,
            currentLayoutJobStateId: layoutState === null ? null : createDiagramLayoutStateId(layoutState),
        })),
        setDiagramOffsets: (diagramOffsets) => set((old) => {
            const stateId = createDiagramLayoutStateId(old);
            const cacheItem = old.layoutCache.get(stateId);

            if (cacheItem && diagramOffsets) {
                cacheItem.diagramOffsets = diagramOffsets;
            }

            return withConceptsToMoveBox({ diagramOffsets }, old);
        }),
        setDiagramOffsetMementos: (diagramOffsetMementos) => set((old) => {
            const stateId = createDiagramLayoutStateId(old);
            const cacheItem = old.layoutCache.get(stateId);

            if (cacheItem && diagramOffsetMementos) {
                cacheItem.diagramOffsetMementos = diagramOffsetMementos;
            }

            return { diagramOffsetMementos };
        }),
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

function createDefaultDiagramOffsets(length: number) {
    const offsets = new Array<Point>(length);

    for (let i = 0; i < length; i++) {
        offsets[i] = createPoint(0, 0, 0);
    }

    return offsets;
}