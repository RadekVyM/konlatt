import { ConceptLattice } from "../../types/ConceptLattice";
import { ExplorerConcept } from "../../types/explorer/ExplorerConcept";
import { ExplorerStore } from "./useExplorerStore";
import withExplorerConcepts from "./withExplorerConcepts";

type ExplorerConceptsSliceState = {
    lattice: ConceptLattice | null, // I do not like this. The same lattice is stored in two different stores.
    concepts: ReadonlyArray<ExplorerConcept>,
    conceptToLayoutIndexesMapping: ReadonlyMap<number, number>,
    layoutToConceptIndexesMapping: ReadonlyMap<number, number>,
}

type ExplorerConceptsSliceActions = {
    /**
     * Initializes or resets the lattice structure.
     *
     * This is called in `useDataStructuresStore()`, I do not like it.
     */
    setupLattice: (lattice: ConceptLattice | null) => void,
}

export type ExplorerConceptsSlice = ExplorerConceptsSliceState & ExplorerConceptsSliceActions

export const initialState: ExplorerConceptsSliceState = {
    lattice: null,
    concepts: [],
    conceptToLayoutIndexesMapping: new Map(),
    layoutToConceptIndexesMapping: new Map(),
};

/**
 * Slice for a Zustand store that manages the explorer concepts and their 
 * mapping to the underlying concept lattice.
 */
export default function createExplorerConceptsSlice(set: (partial: ExplorerStore | Partial<ExplorerStore> | ((state: ExplorerStore) => ExplorerStore | Partial<ExplorerStore>), replace?: false) => void): ExplorerConceptsSlice {
    return {
        ...initialState,
        setupLattice: (lattice) => set((old) => withExplorerConcepts({ lattice }, old)),
    };
}