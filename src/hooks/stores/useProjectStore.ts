import { create } from "zustand";
import { RawFormalContext } from "../../types/RawFormalContext";
import { ConceptLattice } from "../../types/ConceptLattice";
import LatticeWorkerQueue from "../../workers/LatticeWorkerQueue";
import { FormalConcepts } from "../../types/FormalConcepts";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { Point } from "../../types/Point";
import { NodeOffsetMemento } from "../../types/NodeOffsetMemento";
import { StatusItem } from "../../types/StatusItem";

type DiagramOffsetMementos = { undos: Array<NodeOffsetMemento>, redos: Array<NodeOffsetMemento> }

type ProjectStore = {
    progressMessage: string | null,
    file: File | null,
    context: RawFormalContext | null,
    concepts: FormalConcepts | null,
    lattice: ConceptLattice | null,
    layout: ConceptLatticeLayout | null,
    workerQueue: LatticeWorkerQueue,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    statusItems: Array<StatusItem>,
    setProgressMessage: (progressMessage: string | null) => void,
    setFile: (file: File | null) => void,
    setContext: (context: RawFormalContext | null) => void,
    setConcepts: (concepts: FormalConcepts | null) => void,
    setLattice: (lattice: ConceptLattice | null) => void,
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
    clearStatusItems: () => void,
    addStatusItem: (jobId: number, title: string, showProgress?: boolean) => void,
    updateStatusItem: (jobId: number, item: Partial<StatusItem>) => void,
}

const useProjectStore = create<ProjectStore>((set) => ({
    progressMessage: null,
    file: null,
    context: null,
    concepts: null,
    lattice: null,
    layout: null,
    workerQueue: new LatticeWorkerQueue(),
    diagramOffsets: null,
    diagramOffsetMementos: { redos: [], undos: [] },
    statusItems: [],
    setProgressMessage: (progressMessage) => set(() => ({ progressMessage })),
    setFile: (file) => set(() => ({ file })),
    setContext: (context) => set(() => ({ context })),
    setConcepts: (concepts) => set(() => ({ concepts })),
    setLattice: (lattice) => set(() => ({ lattice })),
    setLayout: (layout) => set(() => ({ layout })),
    setDiagramOffsets: (diagramOffsets) => set(() => ({ diagramOffsets })),
    setDiagramOffsetMementos: (diagramOffsetMementos) => set(() => ({ diagramOffsetMementos })),
    clearStatusItems: () => set(() => ({ statusItems: [] })),
    addStatusItem: (jobId: number, title: string, showProgress: boolean = true) => set((state) => ({
        statusItems: [
            {
                jobId,
                title,
                isDone: false,
                showProgress,
                progress: 0,
                startTime: new Date().getTime(),
                endTime: -1
            },
            ...state.statusItems]
    })),
    updateStatusItem: (jobId: number, item: Partial<StatusItem>) => set((state) => {
        const statusItemIndex = state.statusItems.findIndex((item) => item.jobId === jobId);

        if (statusItemIndex === -1) {
            return state;
        }

        state.statusItems[statusItemIndex] = {
            ...state.statusItems[statusItemIndex],
            ...item,
        };

        return { statusItems: [...state.statusItems] };
    }),
}));

export default useProjectStore;