import { create } from "zustand";
import createDiagramLayoutSlice, { initialState as initialDiagramLayoutState, DiagramLayoutSlice } from "./createDiagramLayoutSlice";
import createConceptsFilterSlice, { initialState as initialConceptsFilterState, ConceptsFilterSlice } from "../createConceptsFilterSlice";
import createSelectedConceptSlice, { initialState as initialSelectedConceptState, SelectedConceptSlice } from "../createSelectedConceptSlice";
import createR3FCanvasSlice, { initialState as initialR3FCanvasState, R3FCanvasSlice } from "./createR3FCanvasSlice";
import createDiagramOptionsSlice, { initialState as initialDiagramOptionsState, DiagramOptionsSlice } from "./createDiagramOptionsSlice";
import createDiagramLabelingSlice, { initialState as initialDiagramLabelingState, DiagramLabelingSlice } from "./createDiagramLabelingSlice";

type DiagramStoreState = { }

type DiagramStoreActions = {
    reset: () => void,
}

export type DiagramStore =
    DiagramLayoutSlice &
    DiagramStoreState &
    DiagramStoreActions &
    ConceptsFilterSlice &
    SelectedConceptSlice &
    R3FCanvasSlice &
    DiagramOptionsSlice &
    DiagramLabelingSlice

const initialState: DiagramStoreState = { };

const useDiagramStore = create<DiagramStore>((set) => ({
    ...createDiagramLayoutSlice(set),
    ...createConceptsFilterSlice(set),
    ...createSelectedConceptSlice(set),
    ...createR3FCanvasSlice(set),
    ...createDiagramOptionsSlice(set),
    ...createDiagramLabelingSlice(set),
    ...initialState,
    reset: () => set(() => ({
        ...initialState,
        ...initialDiagramLayoutState,
        ...initialConceptsFilterState,
        ...initialSelectedConceptState,
        ...initialR3FCanvasState,
        ...initialDiagramLabelingState,
        ...initialDiagramOptionsState(),
    })),
}));

export default useDiagramStore;