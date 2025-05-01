import { create } from "zustand";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { Point } from "../types/Point";
import { NodeOffsetMemento } from "../types/NodeOffsetMemento";
import { breadthFirstSearch } from "../utils/graphs";
import { ConceptLattice } from "../types/ConceptLattice";
import useDataStructuresStore from "./useDataStructuresStore";
import createConceptsFilterSlice, { initialState as initialConceptsFilterState, ConceptsFilterSlice } from "./createConceptsFilterSlice";
import createSelectedConceptSlice, { initialState as initialSelectedConceptState, SelectedConceptSlice } from "./createSelectedConceptSlice";

type DiagramOffsetMementos = { undos: Array<NodeOffsetMemento>, redos: Array<NodeOffsetMemento> }

type DiagramStoreState = {
    layout: ConceptLatticeLayout | null,
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
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
    setDisplayHighlightedSublatticeOnly: React.Dispatch<React.SetStateAction<boolean>>,
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex: number | null) => void,
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex: number | null) => void,
    reset: () => void,
}

type DiagramStore = DiagramStoreState & DiagramStoreActions & ConceptsFilterSlice & SelectedConceptSlice

const initialState: DiagramStoreState = {
    layout: null,
    currentLayoutJobId: null,
    diagramOffsets: null,
    diagramOffsetMementos: { redos: [], undos: [] },
    displayHighlightedSublatticeOnly: false,
    upperConeOnlyConceptIndex: null,
    lowerConeOnlyConceptIndex: null,
    visibleConceptIndexes: null,
}

const useDiagramStore = create<DiagramStore>((set) => ({
    ...createConceptsFilterSlice(set),
    ...createSelectedConceptSlice(set),
    ...initialState,
    setLayout: (layout) => set(() => ({ layout })),
    setCurrentLayoutJobId: (currentLayoutJobId) => set(() => ({ currentLayoutJobId })),
    setDiagramOffsets: (diagramOffsets) => set(() => ({ diagramOffsets })),
    setDiagramOffsetMementos: (diagramOffsetMementos) => set(() => ({ diagramOffsetMementos })),
    setDisplayHighlightedSublatticeOnly: (displayHighlightedSublatticeOnly) => set((old) => typeof displayHighlightedSublatticeOnly === "function" ?
        { displayHighlightedSublatticeOnly: displayHighlightedSublatticeOnly(old.displayHighlightedSublatticeOnly) } :
        { displayHighlightedSublatticeOnly }),
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex) => set((old) => ({
        upperConeOnlyConceptIndex,
        visibleConceptIndexes: calculateVisibleConceptIndexes(
            upperConeOnlyConceptIndex,
            old.lowerConeOnlyConceptIndex,
            useDataStructuresStore.getState().lattice),
    })),
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex) => set((old) => ({
        lowerConeOnlyConceptIndex,
        visibleConceptIndexes: calculateVisibleConceptIndexes(
            old.upperConeOnlyConceptIndex,
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


function calculateVisibleConceptIndexes(upperConeOnlyConceptIndex: number | null, lowerConeOnlyConceptIndex: number | null, lattice: ConceptLattice | null) {
    if (upperConeOnlyConceptIndex === null && lowerConeOnlyConceptIndex === null) {
        return null;
    }

    const upperCone = upperConeOnlyConceptIndex !== null && lattice?.superconceptsMapping ?
        collectIndexes(upperConeOnlyConceptIndex, lattice.superconceptsMapping) :
        null;
    
    const lowerCone = lowerConeOnlyConceptIndex !== null && lattice?.subconceptsMapping ?
        collectIndexes(lowerConeOnlyConceptIndex, lattice.subconceptsMapping) :
        null;

    if (upperCone === null) {
        return lowerCone;
    }
    if (lowerCone === null) {
        return upperCone;
    }

    const smaller = upperCone.size > lowerCone.size ? lowerCone : upperCone;
    const larger = upperCone.size > lowerCone.size ? upperCone : lowerCone;

    const intersection = new Array<number>();

    for (const conceptIndex of larger) {
        if (smaller.has(conceptIndex)) {
            intersection.push(conceptIndex);
        }
    }

    return new Set(intersection);
}

function collectIndexes(startIndex: number, relation: ReadonlyArray<Set<number>>) {
    const set = new Set<number>();

    breadthFirstSearch(startIndex, relation, (index) => set.add(index));

    return set;
}