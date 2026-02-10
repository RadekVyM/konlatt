import { create } from "zustand";
import { FormalContext } from "../types/FormalContext";
import { ConceptLattice } from "../types/ConceptLattice";
import { FormalConcepts } from "../types/FormalConcepts";
import useDiagramStore from "./diagram/useDiagramStore";

type DataStructuresStore = {
    context: FormalContext | null,
    concepts: FormalConcepts | null,
    lattice: ConceptLattice | null,
    setContext: (context: FormalContext | null) => void,
    setConcepts: (concepts: FormalConcepts | null) => void,
    setLattice: (lattice: ConceptLattice | null) => void,
    reset: () => void,
}

const useDataStructuresStore = create<DataStructuresStore>((set) => ({
    context: null,
    concepts: null,
    lattice: null,
    setContext: (context) => set(() => {
        if (context) {
            useDiagramStore.getState().setupSelectedLabels(context);
        }
        return { context };
    }),
    setConcepts: (concepts) => set(() => ({ concepts })),
    setLattice: (lattice) => set(() => ({ lattice })),
    reset: () => set(() => ({
        context: null,
        concepts: null,
        lattice: null,
    })),
}));

export default useDataStructuresStore;