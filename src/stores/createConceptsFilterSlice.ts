import { FormalConcept, FormalConcepts } from "../types/FormalConcepts";
import { FormalContext } from "../types/FormalContext";
import { SortDirection } from "../types/SortDirection";
import { ConceptSortType } from "../types/SortType";
import { toSearchTerms } from "../utils/search";
import useDataStructuresStore from "./useDataStructuresStore";

type ConceptsFilterSliceState = {
    debouncedSearchInput: string,
    searchTerms: Array<string>,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    filteredConceptIndexes: Set<number> | null,
    filteredConcepts: FormalConcepts | null,
}

type ConceptsFilterSliceActions = {
    setDebouncedSearchInput: (debouncedSearchInput: string) => void,
    setSortType: (objecsortTypetsSortType: ConceptSortType) => void,
    setSortDirection: (sortDirection: SortDirection) => void,
}

export type ConceptsFilterSlice = ConceptsFilterSliceState & ConceptsFilterSliceActions

export const initialState: ConceptsFilterSliceState = {
    debouncedSearchInput: "",
    searchTerms: [],
    sortType: "default",
    sortDirection: "asc",
    filteredConceptIndexes: null,
    filteredConcepts: null,
};

export default function createConceptsFilterSlice(set: (partial: ConceptsFilterSlice | Partial<ConceptsFilterSlice> | ((state: ConceptsFilterSlice) => ConceptsFilterSlice | Partial<ConceptsFilterSlice>), replace?: false) => void): ConceptsFilterSlice {
    return {
        ...initialState,
        setDebouncedSearchInput: (debouncedSearchInput) => set(() => {
            const searchTerms = toSearchTerms(debouncedSearchInput);

            if (searchTerms.length === 0) {
                return {
                    debouncedSearchInput,
                    searchTerms,
                    filteredConceptIndexes: null,
                    filteredConcepts: null,
                };
            }

            const concepts = useDataStructuresStore.getState().concepts;
            const context = useDataStructuresStore.getState().context;
            const filteredIndexes: Array<number> = [];
            const filteredConcepts: Array<FormalConcept> = [];

            if (concepts && context) {
                for (const concept of concepts) {
                    if (conceptsFilter(concept, searchTerms, context)) {
                        filteredIndexes.push(concept.index);
                        filteredConcepts.push(concept);
                    }
                }
            }

            return {
                debouncedSearchInput,
                searchTerms,
                filteredConceptIndexes: new Set<number>(filteredIndexes),
                filteredConcepts,
            };
        }),
        setSortDirection: (sortDirection) => set({ sortDirection }),
        setSortType: (sortType) => set({ sortType }),
    };
}

function conceptsFilter(concept: FormalConcept, searchTerms: Array<string>, context: FormalContext): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => concept.objects.some((o) => context.objects[o].toLowerCase().includes(term)) ||
            concept.attributes.some((a) => context.attributes[a].toLowerCase().includes(term)));
}