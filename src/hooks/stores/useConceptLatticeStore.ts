import { create } from "zustand";
import { RawFormalContext } from "../../types/RawFormalContext";
import { RawFormalConcept } from "../../types/RawFormalConcept";
import { ConceptLattice } from "../../types/ConceptLattice";

type ConceptLatticeStore = {
    progressMessage: string | null,
    file: File | null,
    context: RawFormalContext | null,
    concepts: Array<RawFormalConcept> | null,
    lattice: ConceptLattice | null,
    setProgressMessage: (progressMessage: string | null) => void,
    setFile: (file: File | null) => void,
    setContext: (context: RawFormalContext | null) => void,
    setConcepts: (concepts: Array<RawFormalConcept> | null) => void,
    setLattice: (lattice: ConceptLattice | null) => void,
}

const useConceptLatticeStore = create<ConceptLatticeStore>((set) => ({
    progressMessage: null,
    file: null,
    context: null,
    concepts: null,
    lattice: null,
    setProgressMessage: (progressMessage) => set(() => ({ progressMessage })),
    setFile: (file) => set(() => ({ file })),
    setContext: (context) => set(() => ({ context })),
    setConcepts: (concepts) => set(() => ({ concepts })),
    setLattice: (lattice) => set(() => ({ lattice })),
}));

export default useConceptLatticeStore;