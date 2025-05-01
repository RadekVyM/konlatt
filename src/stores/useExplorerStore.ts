import { create } from "zustand";
import createConceptsFilterSlice, { ConceptsFilterSlice } from "./createConceptsFilterSlice";
import createSelectedConceptSlice, { SelectedConceptSlice } from "./createSelectedConceptSlice";

type ExplorerStore = {
    reset: () => void,
} & ConceptsFilterSlice & SelectedConceptSlice

const useExplorerStore = create<ExplorerStore>((set) => ({
    ...createConceptsFilterSlice(set),
    ...createSelectedConceptSlice(set),
    reset: () => set(() => ({
        selectedConceptIndex: null,
        debouncedSearchInput: "",
        searchTerms: [],
        filteredConceptIndexes: null,
        filteredConcepts: null,
    })),
}));

export default useExplorerStore;