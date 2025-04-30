import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import useDataStructuresStore from "./useDataStructuresStore";

export type ConceptsFilterSlice = {
    debouncedSearchInput: string,
    searchTerms: Array<string>,
    filteredConceptIndexes: Set<number> | null,
    filteredConcepts: FormalConcepts | null,
    setDebouncedSearchInput: (debouncedSearchInput: string) => void,
}

export default function createConceptsFilterSlice(set: (partial: ConceptsFilterSlice | Partial<ConceptsFilterSlice> | ((state: ConceptsFilterSlice) => ConceptsFilterSlice | Partial<ConceptsFilterSlice>), replace?: false) => void): ConceptsFilterSlice {
    return {
        debouncedSearchInput: "",
        searchTerms: [],
        filteredConceptIndexes: null,
        filteredConcepts: null,
        setDebouncedSearchInput: (debouncedSearchInput) => set(() => {
            const searchTerms = debouncedSearchInput.trim().split(" ").filter((t) => t.length > 0);
    
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
    };
}

function conceptsFilter(concept: FormalConcept, searchTerms: Array<string>, context: FormalContext): boolean {
    return searchTerms
        .map((term) => term.toLowerCase())
        .every((term) => concept.objects.some((o) => context.objects[o].toLowerCase().includes(term)) ||
            concept.attributes.some((a) => context.attributes[a].toLowerCase().includes(term)));
}