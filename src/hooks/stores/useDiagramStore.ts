import { create } from "zustand";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { Point } from "../../types/Point";
import { NodeOffsetMemento } from "../../types/NodeOffsetMemento";

type DiagramOffsetMementos = { undos: Array<NodeOffsetMemento>, redos: Array<NodeOffsetMemento> }

type DiagramStore = {
    layout: ConceptLatticeLayout | null,
    diagramOffsets: Array<Point> | null,
    diagramOffsetMementos: DiagramOffsetMementos,
    selectedConceptIndex: number | null,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    setLayout: (layout: ConceptLatticeLayout | null) => void,
    setDiagramOffsets: (diagramOffsets: Array<Point> | null) => void,
    setDiagramOffsetMementos: (diagramOffsetMementos: DiagramOffsetMementos) => void,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex: number | null) => void,
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex: number | null) => void,
    reset: () => void,
}

const useDiagramStore = create<DiagramStore>((set) => ({
    layout: null,
    diagramOffsets: null,
    diagramOffsetMementos: { redos: [], undos: [] },
    selectedConceptIndex: null,
    upperConeOnlyConceptIndex: null,
    lowerConeOnlyConceptIndex: null,
    setLayout: (layout) => set(() => ({ layout })),
    setDiagramOffsets: (diagramOffsets) => set(() => ({ diagramOffsets })),
    setDiagramOffsetMementos: (diagramOffsetMementos) => set(() => ({ diagramOffsetMementos })),
    setSelectedConceptIndex: (selectedConceptIndex) => {
        if (typeof selectedConceptIndex === "function") {
            set((old) => ({ selectedConceptIndex: selectedConceptIndex(old.selectedConceptIndex) }));
        }
        else {
            set(() => ({ selectedConceptIndex }));
        }
    },
    setUpperConeOnlyConceptIndex: (upperConeOnlyConceptIndex) => set(() => ({ upperConeOnlyConceptIndex })),
    setLowerConeOnlyConceptIndex: (lowerConeOnlyConceptIndex) => set(() => ({ lowerConeOnlyConceptIndex })),
    reset: () => set(() => ({
        layout: null,
        diagramOffsets: null,
        diagramOffsetMementos: { redos: [], undos: [] },
        selectedConceptIndex: null,
        upperConeOnlyConceptIndex: null,
        lowerConeOnlyConceptIndex: null,
    })),
}));

export default useDiagramStore;