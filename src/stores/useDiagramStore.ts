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
}

type DiagramStoreState = {
    layout: ConceptLatticeLayout | null,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutCache: Array<ConceptLatticeLayoutCacheItem>,
    currentLayoutJobId: number | null,
    currentLayoutJobStateId: string | null,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    visibleConceptIndexes: Set<number> | null,
} & DiagramLayoutState

type DiagramStoreActions = {
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setCurrentLayoutJobId: (currentLayoutJobId: number | null, layoutState: DiagramLayoutState | null) => void,
    clearDiagramOffsets: (layoutSize: number) => void,
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
    layoutCache: [],
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
    setLayout: (layout) => set((old) => ({
        layout,
        conceptToLayoutIndexesMapping: layout ? createConceptToLayoutIndexesMapping(layout) : new Map(),
        layoutCache: layout ?
            updateLayoutCache(
                old.layoutCache,
                layout,
                old) :
            [],
    })),
    setCurrentLayoutJobId: (currentLayoutJobId, layoutState) => set(() => ({
        currentLayoutJobId,
        currentLayoutJobStateId: layoutState === null ? null : createDiagramLayoutStateId(layoutState),
    })),
    clearDiagramOffsets: (layoutSize) => set(() => ({
        diagramOffsets: createDefaultDiagramOffsets(layoutSize),
        diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
    })),
    setDiagramOffsets: (diagramOffsets) => set(() => ({ diagramOffsets })),
    setDiagramOffsetMementos: (diagramOffsetMementos) => set(() => ({ diagramOffsetMementos })),
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

    const cachedLayout = tryGetLayoutFromCache(old.layoutCache, stateId);

    if (cachedLayout !== null && cachedLayout === old.layout) {
        return newState;
    }

    if (cachedLayout) {
        if (old.currentLayoutJobId !== null) {
            triggerCancellation(old.currentLayoutJobId);
        }

        return {
            layout: cachedLayout,
            conceptToLayoutIndexesMapping: createConceptToLayoutIndexesMapping(cachedLayout),
            diagramOffsets: createDefaultDiagramOffsets(cachedLayout.length),
            diagramOffsetMementos: createEmptyDiagramOffsetMementos(),
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
    layoutCache: Array<ConceptLatticeLayoutCacheItem>,
    stateId: string,
): ConceptLatticeLayout | null {
    const item = layoutCache.find((item) => item.stateId === stateId);
    return item ? item.layout : null;
}

function updateLayoutCache(
    layoutCache: Array<ConceptLatticeLayoutCacheItem>,
    newLayout: ConceptLatticeLayout,
    layoutState: DiagramLayoutState,
): Array<ConceptLatticeLayoutCacheItem> {
    const stateId = createDiagramLayoutStateId(layoutState);

    return [
        { layout: newLayout, stateId },
        ...layoutCache.filter((item) => item.stateId !== stateId)   
    ];
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