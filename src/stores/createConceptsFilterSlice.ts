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
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    minObjectsCount: number | null,
    maxObjectsCount: number | null,
    minAttributesCount: number | null,
    maxAttributesCount: number | null,
}

type ConceptsFilterSliceActions = {
    setDebouncedSearchInput: (debouncedSearchInput: string) => void,
    setSortType: (objecsortTypetsSortType: ConceptSortType) => void,
    setSortDirection: (sortDirection: SortDirection) => void,
    setSelectedFilters: (
        selectedFilterObjects: ReadonlySet<number>,
        selectedFilterAttributes: ReadonlySet<number>,
        minObjectsCount: number | null,
        maxObjectsCount: number | null,
        minAttributesCount: number | null,
        maxAttributesCount: number | null,
    ) => void,
}

export type ConceptsFilterSlice = ConceptsFilterSliceState & ConceptsFilterSliceActions

export const initialState: ConceptsFilterSliceState = {
    debouncedSearchInput: "",
    searchTerms: [],
    sortType: "default",
    sortDirection: "asc",
    filteredConceptIndexes: null,
    filteredConcepts: null,
    selectedFilterObjects: new Set(),
    selectedFilterAttributes: new Set(),
    minObjectsCount: null,
    maxObjectsCount: null,
    minAttributesCount: null,
    maxAttributesCount: null,
};

export default function createConceptsFilterSlice(set: (partial: ConceptsFilterSlice | Partial<ConceptsFilterSlice> | ((state: ConceptsFilterSlice) => ConceptsFilterSlice | Partial<ConceptsFilterSlice>), replace?: false) => void): ConceptsFilterSlice {
    return {
        ...initialState,
        setDebouncedSearchInput: (debouncedSearchInput) => set((old) => withFilteredConceptIndexes({ debouncedSearchInput }, old)),
        setSelectedFilters: (
            selectedFilterObjects,
            selectedFilterAttributes,
            minObjectsCount,
            maxObjectsCount,
            minAttributesCount,
            maxAttributesCount,
        ) => set((old) =>
            withFilteredConceptIndexes({ selectedFilterObjects, selectedFilterAttributes, minObjectsCount, maxObjectsCount, minAttributesCount, maxAttributesCount }, old)),
        setSortDirection: (sortDirection) => set({ sortDirection }),
        setSortType: (sortType) => set({ sortType }),
    };
}

function withFilteredConceptIndexes(newState: Partial<ConceptsFilterSlice>, oldState: ConceptsFilterSlice): Partial<ConceptsFilterSlice> {
    const debouncedSearchInput = newState.debouncedSearchInput !== undefined ?
        newState.debouncedSearchInput :
        oldState.debouncedSearchInput;
    const selectedFilterObjects = newState.selectedFilterObjects !== undefined ?
        newState.selectedFilterObjects :
        oldState.selectedFilterObjects;
    const selectedFilterAttributes = newState.selectedFilterAttributes !== undefined ?
        newState.selectedFilterAttributes :
        oldState.selectedFilterAttributes;
    const minObjectsCount = newState.minObjectsCount !== undefined ?
        newState.minObjectsCount :
        oldState.minObjectsCount;
    const maxObjectsCount = newState.maxObjectsCount !== undefined ?
        newState.maxObjectsCount :
        oldState.maxObjectsCount;
    const minAttributesCount = newState.minAttributesCount !== undefined ?
        newState.minAttributesCount :
        oldState.minAttributesCount;
    const maxAttributesCount = newState.maxAttributesCount !== undefined ?
        newState.maxAttributesCount :
        oldState.maxAttributesCount;
    const searchTerms = toSearchTerms(debouncedSearchInput);

    if (
        searchTerms.length === 0 &&
        selectedFilterObjects.size === 0 &&
        selectedFilterAttributes.size === 0 &&
        minObjectsCount === null &&
        maxObjectsCount === null &&
        minAttributesCount === null &&
        maxAttributesCount === null
    ) {
        return {
            ...newState,
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
        const lowerSearchTerms = searchTerms.map((t) => t.toLowerCase());

        for (const concept of concepts) {
            if (conceptFilter(
                concept,
                lowerSearchTerms,
                context,
                selectedFilterObjects,
                selectedFilterAttributes,
                minObjectsCount,
                maxObjectsCount,
                minAttributesCount,
                maxAttributesCount,
            )) {
                filteredIndexes.push(concept.index);
                filteredConcepts.push(concept);
            }
        }
    }

    return {
        ...newState,
        searchTerms,
        filteredConceptIndexes: new Set<number>(filteredIndexes),
        filteredConcepts,
    };
}

function conceptFilter(
    concept: FormalConcept,
    searchTerms: Array<string>,
    context: FormalContext,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    minObjectsCount: number | null,
    maxObjectsCount: number | null,
    minAttributesCount: number | null,
    maxAttributesCount: number | null,
): boolean {
    if ((minObjectsCount !== null && concept.objects.length < minObjectsCount) ||
        (maxObjectsCount !== null && concept.objects.length > maxObjectsCount) ||
        (minAttributesCount !== null && concept.attributes.length < minAttributesCount) ||
        (maxAttributesCount !== null && concept.attributes.length > maxAttributesCount)) {
        return false;
    }

    // The concept has to contain one of the selected objects AND
    // one of the selected attributes AND
    // all the search terms

    let hasObject = selectedFilterObjects.size === 0;
    let hasAttribute = selectedFilterAttributes.size === 0;

    for (const object of concept.objects) {
        if (hasObject && searchTerms.length === 0) {
            break;
        }

        if (selectedFilterObjects.size !== 0 && selectedFilterObjects.has(object)) {
            hasObject = true;

            if (searchTerms.length === 0) {
                break;
            }
        }

        for (let i = 0; i < searchTerms.length; i++) {
            const term = searchTerms[i];

            if (context.objects[object].toLowerCase().includes(term)) {
                searchTerms = searchTerms.filter((_t, ti) => ti !== i);
                i--;
            }
        }
    }

    if (!hasObject) {
        return false;
    }

    for (const attribute of concept.attributes) {
        if (hasAttribute && searchTerms.length === 0) {
            break;
        }

        if (selectedFilterAttributes.size !== 0 && selectedFilterAttributes.has(attribute)) {
            hasAttribute = true;

            if (searchTerms.length === 0) {
                break;
            }
        }

        for (let i = 0; i < searchTerms.length; i++) {
            const term = searchTerms[i];

            if (context.attributes[attribute].toLowerCase().includes(term)) {
                searchTerms = searchTerms.filter((_t, ti) => ti !== i);
                i--;
            }
        }
    }

    return hasObject && hasAttribute && searchTerms.length === 0;
}