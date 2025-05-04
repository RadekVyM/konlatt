import { create } from "zustand";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { createPoint, Point } from "../types/Point";
import { NodeOffsetMemento } from "../types/NodeOffsetMemento";
import useDataStructuresStore from "./useDataStructuresStore";
import createConceptsFilterSlice, { initialState as initialConceptsFilterState, ConceptsFilterSlice } from "./createConceptsFilterSlice";
import createSelectedConceptSlice, { initialState as initialSelectedConceptState, SelectedConceptSlice } from "./createSelectedConceptSlice";
import { triggerCancellation, triggerLayoutComputation } from "../services/triggers";
import { calculateVisibleConceptIndexes } from "../utils/lattice";

type DiagramOffsetMementos = { undos: Array<NodeOffsetMemento>, redos: Array<NodeOffsetMemento> }

type ConceptLatticeLayoutCacheItem = {
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    layout: ConceptLatticeLayout,
}

type DiagramStoreState = {
    layout: ConceptLatticeLayout | null,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutCache: Array<ConceptLatticeLayoutCacheItem>,
    currentLayoutJobId: number | null,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    displayHighlightedSublatticeOnly: boolean,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    visibleConceptIndexes: Set<number> | null,
}

type DiagramStoreActions = {
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setCurrentLayoutJobId: (currentLayoutJobId: number | null) => void,
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
                old.displayHighlightedSublatticeOnly ? old.upperConeOnlyConceptIndex : null,
                old.displayHighlightedSublatticeOnly ? old.lowerConeOnlyConceptIndex : null) :
            [],
    })),
    setCurrentLayoutJobId: (currentLayoutJobId) => set(() => ({ currentLayoutJobId })),
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
            value,
            old.upperConeOnlyConceptIndex,
            old.lowerConeOnlyConceptIndex,
            { displayHighlightedSublatticeOnly: value });
    }),
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex, withOtherReset) => set((old) => withLayout(
        old,
        old.displayHighlightedSublatticeOnly,
        upperConeOnlyConceptIndex,
        withOtherReset ? null : old.lowerConeOnlyConceptIndex,
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
        old.displayHighlightedSublatticeOnly,
        withOtherReset ? null : old.upperConeOnlyConceptIndex,
        lowerConeOnlyConceptIndex,
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
    displayHighlightedSublatticeOnly: boolean,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    newState: Partial<DiagramStore>,
): Partial<DiagramStore> {
    if (!displayHighlightedSublatticeOnly && old.layoutCache.length === 0) {
        // Do not react to upperConeOnlyConceptIndex and lowerConeOnlyConceptIndex changes
        // when nothing is rendered yet
        return newState;
    }

    const cachedLayout = displayHighlightedSublatticeOnly ?
        tryGetLayoutFromCache(old.layoutCache, upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex) :
        tryGetLayoutFromCache(old.layoutCache, null, null);

    if (cachedLayout !== null && cachedLayout === old.layout) {
        return newState;
    }

    if (cachedLayout) {
        if (old.currentLayoutJobId) {
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

    triggerLayoutComputation(displayHighlightedSublatticeOnly, upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex);

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
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null
): ConceptLatticeLayout | null {
    const item = layoutCache.find((item) => item.lowerConeOnlyConceptIndex === lowerConeOnlyConceptIndex && item.upperConeOnlyConceptIndex === upperConeOnlyConceptIndex);
    return item ? item.layout : null;
}

function updateLayoutCache(
    layoutCache: Array<ConceptLatticeLayoutCacheItem>,
    newLayout: ConceptLatticeLayout,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null
): Array<ConceptLatticeLayoutCacheItem> {
    return [
        { layout: newLayout, upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex },
        ...layoutCache.filter((item) =>
            item.lowerConeOnlyConceptIndex !== lowerConeOnlyConceptIndex ||
            item.upperConeOnlyConceptIndex !== upperConeOnlyConceptIndex)   
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