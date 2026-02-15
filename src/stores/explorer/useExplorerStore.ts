import { create } from "zustand";
import createConceptsFilterSlice, { ConceptsFilterSlice, initialState as conceptsFilterInitialState } from "../createConceptsFilterSlice";
import createSelectedConceptSlice, { SelectedConceptSlice, initialState as selectedConceptInitialState } from "../createSelectedConceptSlice";
import createR3FCanvasSlice, { R3FCanvasSlice, initialState as r3fCanvasInitialState } from "./createR3FCanvasSlice";
import createExplorerConceptsSlice, { ExplorerConceptsSlice, initialState as explorerConceptsInitialState } from "./createExplorerConceptsSlice";
import withExplorerConcepts from "./withExplorerConcepts";

export type ExplorerStore = {
    reset: () => void,
} & ConceptsFilterSlice & SelectedConceptSlice & R3FCanvasSlice & ExplorerConceptsSlice

const useExplorerStore = create<ExplorerStore>((set) => ({
    ...createConceptsFilterSlice(set),
    ...createSelectedConceptSlice(set, withExplorerConcepts),
    ...createR3FCanvasSlice(set),
    ...createExplorerConceptsSlice(set),
    reset: () => set(() => ({
        ...selectedConceptInitialState,
        ...conceptsFilterInitialState,
        ...r3fCanvasInitialState,
        ...explorerConceptsInitialState,
    })),
}));

export default useExplorerStore;