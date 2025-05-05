import { create } from "zustand";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { createPoint, Point } from "../types/Point";
import { NodeOffsetMemento } from "../types/NodeOffsetMemento";
import useDataStructuresStore from "./useDataStructuresStore";
import createConceptsFilterSlice, { initialState as initialConceptsFilterState, ConceptsFilterSlice } from "./createConceptsFilterSlice";
import createSelectedConceptSlice, { initialState as initialSelectedConceptState, SelectedConceptSlice } from "./createSelectedConceptSlice";
import { triggerCancellation, triggerLayoutComputation } from "../services/triggers";
import { calculateVisibleConceptIndexes } from "../utils/lattice";
import { DiagramLayoutState } from "../types/DiagramLayoutState";

type DiagramOffsetMementos = { undos: Array<NodeOffsetMemento>, redos: Array<NodeOffsetMemento> }

type ConceptLatticeLayoutCacheItem = {
    stateId: string,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    diagramOffsetMementos: DiagramOffsetMementos,
}

type DiagramStoreState = {
    layout: ConceptLatticeLayout | null,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutCache: Map<string, ConceptLatticeLayoutCacheItem>,
    currentLayoutJobId: number | null,
    currentLayoutJobStateId: string | null,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    visibleConceptIndexes: Set<number> | null,
} & DiagramLayoutState

type DiagramStoreActions = {
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setCurrentLayoutJobId: (currentLayoutJobId: number | null, layoutState: DiagramLayoutState | null) => void,
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
    setDisplayHighlightedSublatticeOnly: React.Dispatch<React.SetStateAction<boolean>>,
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex: number | null, withOtherReset?: boolean) => void,
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex: number | null, withOtherReset?: boolean) => void,
    reset: () => void,
}

type DiagramStore = DiagramStoreState & DiagramStoreActions & ConceptsFilterSlice & SelectedConceptSlice

const initialState: DiagramStoreState = {
    layout: null,
    layoutCache: new Map(),
    conceptToLayoutIndexesMapping: new Map(),
    currentLayoutJobId: null,
    currentLayoutJobStateId: null,
    diagramOffsets: null,
    diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
    displayHighlightedSublatticeOnly: false,
    upperConeOnlyConceptIndex: null,
    lowerConeOnlyConceptIndex: null,
    visibleConceptIndexes: null,
};

const useDiagramStore = create<DiagramStore>((set) => ({
    ...createConceptsFilterSlice(set),
    ...createSelectedConceptSlice(set),
    ...initialState,
    setLayout: (layout) => set((old) => {
        const diagramOffsets = layout ? createDefaultDiagramOffsets(layout.length) : null;
        const diagramOffsetMementos = createEmptyDiagramOffsetMementos();

        return {
            layout,
            conceptToLayoutIndexesMapping: layout ?
                createConceptToLayoutIndexesMapping(layout) :
                new Map(),
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
        };
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

        return { diagramOffsets };
    }),
    setDiagramOffsetMementos: (diagramOffsetMementos) => set((old) => {
        const stateId = createDiagramLayoutStateId(old);
        const cacheItem = old.layoutCache.get(stateId);

        if (cacheItem && diagramOffsetMementos) {
            cacheItem.diagramOffsetMementos = diagramOffsetMementos;
        }

        return { diagramOffsetMementos };
    }),
    setDisplayHighlightedSublatticeOnly: (displayHighlightedSublatticeOnly) => set((old) => {
        const value = typeof displayHighlightedSublatticeOnly === "function" ?
            displayHighlightedSublatticeOnly(old.displayHighlightedSublatticeOnly) :
            displayHighlightedSublatticeOnly;

        return withLayout(
            old,
            { displayHighlightedSublatticeOnly: value });
    }),
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex, withOtherReset) => set((old) => withLayout(
        old,
        {
            upperConeOnlyConceptIndex,
            lowerConeOnlyConceptIndex: withOtherReset ? null : old.lowerConeOnlyConceptIndex,
            visibleConceptIndexes: calculateVisibleConceptIndexes(
                upperConeOnlyConceptIndex,
                withOtherReset ? null : old.lowerConeOnlyConceptIndex,
                useDataStructuresStore.getState().lattice),
        })),
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex, withOtherReset) => set((old) => withLayout(
        old,
        {
            lowerConeOnlyConceptIndex,
            upperConeOnlyConceptIndex: withOtherReset ? null : old.upperConeOnlyConceptIndex,
            visibleConceptIndexes: calculateVisibleConceptIndexes(
                withOtherReset ? null : old.upperConeOnlyConceptIndex,
                lowerConeOnlyConceptIndex,
                useDataStructuresStore.getState().lattice),
        })),
    reset: () => set(() => ({
        ...initialState,
        ...initialConceptsFilterState,
        ...initialSelectedConceptState,
    })),
}));

export default useDiagramStore;


function withLayout(
    old: DiagramStore,
    newState: Partial<DiagramStore>,
): Partial<DiagramStore> {
    const layoutState: DiagramLayoutState = { ...old, ...newState };
    const stateId = createDiagramLayoutStateId(layoutState);

    if (old.currentLayoutJobStateId === stateId) {
        // Do not react to upperConeOnlyConceptIndex and lowerConeOnlyConceptIndex changes
        // when nothing is rendered yet
        return newState;
    }

    const cachedLayoutItem = tryGetLayoutFromCache(old.layoutCache, stateId);

    if (cachedLayoutItem !== null && cachedLayoutItem.layout === old.layout) {
        return newState;
    }

    if (cachedLayoutItem) {
        if (old.currentLayoutJobId !== null) {
            triggerCancellation(old.currentLayoutJobId);
        }

        return {
            layout: cachedLayoutItem.layout,
            conceptToLayoutIndexesMapping: createConceptToLayoutIndexesMapping(cachedLayoutItem.layout),
            diagramOffsets: cachedLayoutItem.diagramOffsets,
            diagramOffsetMementos: cachedLayoutItem.diagramOffsetMementos,
            ...newState,
        };
    }

    triggerLayoutComputation(layoutState);

    return {
        layout: null,
        conceptToLayoutIndexesMapping: new Map(),
        diagramOffsets: null,
        diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
        ...newState,
    };
}

function tryGetLayoutFromCache(
    layoutCache: Map<string, ConceptLatticeLayoutCacheItem>,
    stateId: string,
): ConceptLatticeLayoutCacheItem | null {
    return layoutCache.get(stateId) || null;
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

function createEmptyDiagramOffsetMementos() {
    return { redos: [], undos: [] };
}

function createConceptToLayoutIndexesMapping(layout: ConceptLatticeLayout) {
    const mapping = new Map<number, number>();

    for (let i = 0; i < layout.length; i++) {
        const point = layout[i];
        mapping.set(point.conceptIndex, i);
    }

    return mapping;
}

function createDiagramLayoutStateId(state: DiagramLayoutState) {
    const start = state.displayHighlightedSublatticeOnly ?
        `${state.lowerConeOnlyConceptIndex};${state.upperConeOnlyConceptIndex}` :
        "null;null";

    return `${start}`;
}