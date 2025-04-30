import { create } from "zustand";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { Point } from "../../types/Point";
import { NodeOffsetMemento } from "../../types/NodeOffsetMemento";
import { breadthFirstSearch } from "../../utils/graphs";
import { ConceptLattice } from "../../types/ConceptLattice";
import useDataStructuresStore from "./useDataStructuresStore";
import createConceptsFilterSlice, { ConceptsFilterSlice } from "./createConceptsFilterSlice";
import createSelectedConceptSlice, { SelectedConceptSlice } from "./createSelectedConceptSlice";

type DiagramOffsetMementos = { undos: Array<NodeOffsetMemento>, redos: Array<NodeOffsetMemento> }

type DiagramStore = {
    layout: ConceptLatticeLayout | null,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    visibleConceptIndexes: Set<number> | null,
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex: number | null) => void,
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex: number | null) => void,
    reset: () => void,
} & ConceptsFilterSlice & SelectedConceptSlice

const useDiagramStore = create<DiagramStore>((set) => ({
    ...createConceptsFilterSlice(set),
    ...createSelectedConceptSlice(set),
    layout: null,
    diagramOffsets: null,
    diagramOffsetMementos: { redos: [], undos: [] },
    upperConeOnlyConceptIndex: null,
    lowerConeOnlyConceptIndex: null,
    visibleConceptIndexes: null,
    setLayout: (layout) => set(() => ({ layout })),
    setDiagramOffsets: (diagramOffsets) => set(() => ({ diagramOffsets })),
    setDiagramOffsetMementos: (diagramOffsetMementos) => set(() => ({ diagramOffsetMementos })),
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
        layout: null,
        diagramOffsets: null,
        diagramOffsetMementos: { redos: [], undos: [] },
        selectedConceptIndex: null,
        debouncedSearchInput: "",
        searchTerms: [],
        upperConeOnlyConceptIndex: null,
        lowerConeOnlyConceptIndex: null,
        visibleConceptIndexes: null,
        filteredConceptIndexes: null,
        filteredConcepts: null,
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