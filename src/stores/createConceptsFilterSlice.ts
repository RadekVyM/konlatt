import { FormalConcept, FormalConcepts } from "../types/FormalConcepts";
import { FormalContext } from "../types/FormalContext";
import { SortDirection } from "../types/SortDirection";
import { ConceptSortType } from "../types/SortType";
import { toSearchTerms } from "../utils/search";
import { withFallback } from "../utils/stores";
import useDataStructuresStore from "./useDataStructuresStore";

type ConceptsFilterSliceState = {
    debouncedSearchInput: string,
    searchTerms: ReadonlyArray<string>,
    sortType: ConceptSortType,
    sortDirection: SortDirection,
    /** Indexes of concepts matching the current filter criteria; `null` if no filter is active. */
    filteredConceptIndexes: ReadonlySet<number> | null,
    /** The actual concept objects matching the filter; `null` if no filter is active. */
    filteredConcepts: FormalConcepts | null,
    strictSelectedObjects: boolean,
    strictSelectedAttributes: boolean,
    selectedFilterObjects: ReadonlySet<number>,
    selectedFilterAttributes: ReadonlySet<number>,
    minObjectsCount: number | null,
    maxObjectsCount: number | null,
    minAttributesCount: number | null,
    maxAttributesCount: number | null,
}

type ConceptsFilterSliceActions = {
    /** Updates the search input and triggers a re-filter. */
    setDebouncedSearchInput: (debouncedSearchInput: string) => void,
    /** Sets the criteria by which concepts are sorted. */
    setSortType: (objecsortTypetsSortType: ConceptSortType) => void,
    /** Sets the sorting order (ascending or descending). */
    setSortDirection: (sortDirection: SortDirection) => void,
    /** Updates multiple filter constraints at once and triggers a re-filter. */
    setSelectedFilters: (
        strictSelectedObjects: boolean,
        strictSelectedAttributes: boolean,
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
    strictSelectedObjects: false,
    strictSelectedAttributes: false,
    selectedFilterObjects: new Set(),
    selectedFilterAttributes: new Set(),
    minObjectsCount: null,
    maxObjectsCount: null,
    minAttributesCount: null,
    maxAttributesCount: null,
};

/**
 * Slice for a Zustand store that manages the state representing the active filters and resulting data for formal concepts.
 */
export default function createConceptsFilterSlice(set: (partial: ConceptsFilterSlice | Partial<ConceptsFilterSlice> | ((state: ConceptsFilterSlice) => ConceptsFilterSlice | Partial<ConceptsFilterSlice>), replace?: false) => void): ConceptsFilterSlice {
    return {
        ...initialState,
        setDebouncedSearchInput: (debouncedSearchInput) => set((old) => withFilteredConceptIndexes({ debouncedSearchInput }, old)),
        setSelectedFilters: (
            strictSelectedObjects,
            strictSelectedAttributes,
            selectedFilterObjects,
            selectedFilterAttributes,
            minObjectsCount,
            maxObjectsCount,
            minAttributesCount,
            maxAttributesCount,
        ) => set((old) =>
            withFilteredConceptIndexes({
                strictSelectedObjects,
                strictSelectedAttributes,
                selectedFilterObjects,
                selectedFilterAttributes,
                minObjectsCount,
                maxObjectsCount,
                minAttributesCount,
                maxAttributesCount
            }, old)),
        setSortDirection: (sortDirection) => set({ sortDirection }),
        setSortType: (sortType) => set({ sortType }),
    };
}

/**
 * Computes the filtered concept list whenever relevant state changes.
 */
function withFilteredConceptIndexes(newState: Partial<ConceptsFilterSlice>, oldState: ConceptsFilterSlice): Partial<ConceptsFilterSlice> {
    const debouncedSearchInput = withFallback(newState.debouncedSearchInput, oldState.debouncedSearchInput);
    const strictSelectedObjects = withFallback(newState.strictSelectedObjects, oldState.strictSelectedObjects);
    const strictSelectedAttributes = withFallback(newState.strictSelectedAttributes, oldState.strictSelectedAttributes);
    const selectedFilterObjects = withFallback(newState.selectedFilterObjects, oldState.selectedFilterObjects);
    const selectedFilterAttributes = withFallback(newState.selectedFilterAttributes, oldState.selectedFilterAttributes);
    const minObjectsCount = withFallback(newState.minObjectsCount, oldState.minObjectsCount);
    const maxObjectsCount = withFallback(newState.maxObjectsCount, oldState.maxObjectsCount);
    const minAttributesCount = withFallback(newState.minAttributesCount, oldState.minAttributesCount);
    const maxAttributesCount = withFallback(newState.maxAttributesCount, oldState.maxAttributesCount);
    const searchTerms = toSearchTerms(debouncedSearchInput);

    // If no filters are active, return early to reset the filtered state to null
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
                strictSelectedObjects,
                strictSelectedAttributes,
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

/**
 * Evaluates whether a single concept meets all current filter criteria.
 * Logic order:
 * 1. Count constraints (min/max objects/attributes)
 * 2. Mandatory object inclusions (strict vs loose)
 * 3. Mandatory attribute inclusions (strict vs loose)
 * 4. Fuzzy search terms across object/attribute labels
 */
function conceptFilter(
    concept: FormalConcept,
    searchTerms: ReadonlyArray<string>,
    context: FormalContext,
    strictSelectedObjects: boolean,
    strictSelectedAttributes: boolean,
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

    // The concept has to contain
    // (all the selected objects if strict filtering is enabled, else one of the selected objects OR) AND
    // (all the selected attributes if strict filtering is enabled, else one of the selected attributes) AND
    // all the search terms

    selectedFilterObjects = new Set(selectedFilterObjects);
    selectedFilterAttributes = new Set(selectedFilterAttributes);

    // If strict, concept must contain ALL filter objects. If loose, at least ONE.
    if (selectedFilterObjects.size > 0) {
        const selectedObjects = concept.objects.filter((obj) => selectedFilterObjects.has(obj));
        const hasObjects = strictSelectedObjects ?
            selectedObjects.length === selectedFilterObjects.size :
            selectedObjects.length > 0;

        if (!hasObjects) {
            return false;
        }
    }

    // If strict, concept must contain ALL filter attributes. If loose, at least ONE.
    if (selectedFilterAttributes.size > 0) {
        const selectedAttributes = concept.attributes.filter((attr) => selectedFilterAttributes.has(attr));
        const hasAttributes = strictSelectedAttributes ?
            selectedAttributes.length === selectedFilterAttributes.size :
            selectedAttributes.length > 0;

        if (!hasAttributes) {
            return false;
        }
    }

    // Every search term must be found in at least one object label or attribute label
    const hasSearchTerms = searchTerms.length === 0 ||
        searchTerms.every((term) =>
            concept.objects.some((obj) => context.objects[obj].toLocaleLowerCase().includes(term)) ||
            concept.attributes.some((attr) => context.attributes[attr].toLocaleLowerCase().includes(term)));

    return hasSearchTerms;
}