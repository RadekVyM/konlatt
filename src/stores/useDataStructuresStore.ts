import { create } from "zustand";
import { FormalContext } from "../types/FormalContext";
import { ConceptLattice } from "../types/ConceptLattice";
import { FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import useDiagramStore from "./diagram/useDiagramStore";
import useExplorerStore from "./explorer/useExplorerStore";
import { withFallback } from "../utils/stores";

type DataStructuresStore = {
    context: FormalContext | null,
    concepts: FormalConcepts | null,
    supremumIndex: number | null,
    infimumIndex: number | null,
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
    supremumIndex: null,
    infimumIndex: null,
    setContext: (context) => {
        set({ context });

        if (context) {
            useDiagramStore.getState().setupSelectedLabels(context);
        }
    },
    setConcepts: (concepts) => set((old) => withSupremumInfimum({ concepts }, old)),
    setLattice: (lattice) => {
        set({ lattice });
        useExplorerStore.getState().setupLattice(lattice);
    },
    reset: () => set(() => ({
        context: null,
        concepts: null,
        lattice: null,
    })),
}));

export default useDataStructuresStore;

function withSupremumInfimum(newState: Partial<DataStructuresStore>, oldState: DataStructuresStore): Partial<DataStructuresStore> {
    const concepts = withFallback(newState.concepts, oldState.concepts);

    if (!concepts) {
        return newState;
    }

    return {
        ...newState,
        infimumIndex: getInfimum(concepts).index,
        supremumIndex: getSupremum(concepts).index,
    };
}