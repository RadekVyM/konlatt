import { ConceptLattice } from "../../types/ConceptLattice";
import { ExplorerConcept } from "../../types/explorer/ExplorerConcept";
import { ExplorerStore } from "./useExplorerStore";
import withExplorerConcepts from "./withExplorerConcepts";

type ExplorerConceptsSliceState = {
    lattice: ConceptLattice | null, // I do not like this
    concepts: ReadonlyArray<ExplorerConcept>,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutToConceptIndexesMapping: Map<number, number>,
}

type ExplorerConceptsSliceActions = {
    setupLattice: (lattice: ConceptLattice | null) => void, // This is called in useDataStructuresStore(), I do not like it
}

export type ExplorerConceptsSlice = ExplorerConceptsSliceState & ExplorerConceptsSliceActions

export const initialState: ExplorerConceptsSliceState = {
    lattice: null,
    concepts: [],
    conceptToLayoutIndexesMapping: new Map(),
    layoutToConceptIndexesMapping: new Map(),
};

export default function createExplorerConceptsSlice(set: (partial: ExplorerStore | Partial<ExplorerStore> | ((state: ExplorerStore) => ExplorerStore | Partial<ExplorerStore>), replace?: false) => void): ExplorerConceptsSlice {
    return {
        ...initialState,
        setupLattice: (lattice) => set((old) => withExplorerConcepts({ lattice }, old)),
    };
}