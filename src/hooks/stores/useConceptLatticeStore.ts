import { create } from "zustand";
import { RawFormalContext } from "../../types/RawFormalContext";
import { ConceptLattice } from "../../types/ConceptLattice";
import LatticeWorkerQueue from "../../workers/LatticeWorkerQueue";
import { FormalConcepts } from "../../types/FormalConcepts";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";

type ConceptLatticeStore = {
    progressMessage: string | null,
    file: File | null,
    context: RawFormalContext | null,
    concepts: FormalConcepts | null,
    lattice: ConceptLattice | null,
    layout: ConceptLatticeLayout | null,
    workerQueue: LatticeWorkerQueue,
    setProgressMessage: (progressMessage: string | null) => void,
    setFile: (file: File | null) => void,
    setContext: (context: RawFormalContext | null) => void,
    setConcepts: (concepts: FormalConcepts | null) => void,
    setLattice: (lattice: ConceptLattice | null) => void,
    setLayout: (layout: ConceptLatticeLayout | null) => void,
}

const useConceptLatticeStore = create<ConceptLatticeStore>((set) => ({
    progressMessage: null,
    file: null,
    context: null,
    concepts: null,
    lattice: null,
    layout: null,
    workerQueue: new LatticeWorkerQueue(),
    setProgressMessage: (progressMessage) => set(() => ({ progressMessage })),
    setFile: (file) => set(() => ({ file })),
    setContext: (context) => set(() => ({ context })),
    setConcepts: (concepts) => set(() => ({ concepts })),
    setLattice: (lattice) => set(() => ({ lattice })),
    setLayout: (layout) => set(() => ({ layout })),
}));

export default useConceptLatticeStore;