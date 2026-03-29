import { create } from "zustand";
import useDataStructuresStore from "./useDataStructuresStore";
import { searchStringFilter, toSearchTerms } from "../utils/search";
import { ItemSortType } from "../types/SortType";
import { SortDirection } from "../types/SortDirection";
import { FormalContext, getAttributeObjects, getObjectAttributes } from "../types/FormalContext";
import { withFallback } from "../utils/stores";

type ContextStoreState = {
    debouncedObjectsSearchInput: string,
    objectsSearchTerms: ReadonlyArray<string>,
    objectsSortType: ItemSortType,
    objectsSortDirection: SortDirection,
    debouncedAttributesSearchInput: string,
    attributesSearchTerms: ReadonlyArray<string>,
    attributesSortType: ItemSortType,
    attributesSortDirection: SortDirection,
    selectedObject: number | null,
    /** If `true`, performs an intersection. If `false`, performs a union. */
    strictSelectedFilterAttributes: boolean,
    /** List of attributes used to filter objects. */
    selectedFilterAttributes: ReadonlyArray<number>,
    /** Set of filtered objects based on selected filter attributes. */
    filteredObjects: ReadonlySet<number> | null,
    selectedAttribute: number | null,
    /** If `true`, performs an intersection. If `false`, performs a union. */
    strictSelectedFilterObjects: boolean,
    /** List of objects used to filter attributes. */
    selectedFilterObjects: ReadonlyArray<number>,
    /** Set of filtered attributes based on selected filter objects. */
    filteredAttributes: ReadonlySet<number> | null,
}

type ContextStoreActions = {
    setDebouncedObjectsSearchInput: (debouncedObjectsSearchInput: string) => void,
    setObjectsSortType: (objectsSortType: ItemSortType) => void,
    setObjectsSortDirection: (objectsSortDirection: SortDirection) => void,
    setDebouncedAttributesSearchInput: (debouncedAttributesSearchInput: string) => void,
    setAttributesSortType: (attributesSortType: ItemSortType) => void,
    setAttributesSortDirection: (attributesSortDirection: SortDirection) => void,
    setSelectedObject: (selectedObject: number | null) => void,
    setSelectedAttribute: (selectedAttribute: number | null) => void,
    setSelection: (selectedObject: number | null, selectedAttribute: number | null) => void,
    setSelectedFilterAttributes: (selectedFilterAttributes: ReadonlyArray<number>, strictSelectedFilterAttributes: boolean) => void,
    setSelectedFilterObjects: (selectedFilterObjects: ReadonlyArray<number>, strictSelectedFilterObjects: boolean) => void,
    reset: () => void,
}

type ContextStore = ContextStoreState & ContextStoreActions

const initialState: ContextStoreState = {
    debouncedObjectsSearchInput: "",
    objectsSearchTerms: [],
    objectsSortType: "default",
    objectsSortDirection: "asc",
    debouncedAttributesSearchInput: "",
    attributesSearchTerms: [],
    attributesSortType: "default",
    attributesSortDirection: "asc",
    selectedObject: null,
    strictSelectedFilterAttributes: false,
    selectedFilterAttributes: [],
    filteredObjects: null,
    selectedAttribute: null,
    strictSelectedFilterObjects: false,
    selectedFilterObjects: [],
    filteredAttributes: null,
};

/**
 * Store for formal context table. 
 */
const useContextStore = create<ContextStore>((set) => ({
    ...initialState,
    setDebouncedObjectsSearchInput: (debouncedObjectsSearchInput) => set((old) => withFilteredObjects({ debouncedObjectsSearchInput }, old)),
    setObjectsSortDirection: (objectsSortDirection) => set({ objectsSortDirection }),
    setObjectsSortType: (objectsSortType) => set({ objectsSortType }),
    setDebouncedAttributesSearchInput: (debouncedAttributesSearchInput) => set((old) => withFilteredAttributes({ debouncedAttributesSearchInput }, old)),
    setAttributesSortDirection: (attributesSortDirection) => set({ attributesSortDirection }),
    setAttributesSortType: (attributesSortType) => set({ attributesSortType }),
    setSelectedObject: (selectedObject) => set(() => ({ selectedObject })),
    setSelectedAttribute: (selectedAttribute) => set(() => ({ selectedAttribute })),
    setSelection: (selectedObject, selectedAttribute) => set(() => ({ selectedObject, selectedAttribute })),
    setSelectedFilterAttributes: (selectedFilterAttributes, strictSelectedFilterAttributes) =>
        set((old) => withFilteredObjects({ selectedFilterAttributes, strictSelectedFilterAttributes }, old)),
    setSelectedFilterObjects: (selectedFilterObjects, strictSelectedFilterObjects) =>
        set((old) => withFilteredAttributes({ selectedFilterObjects, strictSelectedFilterObjects }, old)),
    reset: () => set(() => ({
        ...initialState,
    })),
}));

export default useContextStore;

/**
 * Calculates the new state for filtered objects based on search terms 
 * and selected attribute filters.
 */
function withFilteredObjects(newState: Partial<ContextStore>, oldState: ContextStore): Partial<ContextStore> {
    const debouncedObjectsSearchInput = withFallback(newState.debouncedObjectsSearchInput, oldState.debouncedObjectsSearchInput);
    const selectedFilterAttributes = withFallback(newState.selectedFilterAttributes, oldState.selectedFilterAttributes);
    const strictSelectedFilterAttributes = withFallback(newState.strictSelectedFilterAttributes, oldState.strictSelectedFilterAttributes);
    const objectsSearchTerms = toSearchTerms(debouncedObjectsSearchInput);
    const context = useDataStructuresStore.getState().context;

    if ((objectsSearchTerms.length === 0 && selectedFilterAttributes.length === 0) || !context || context.objects.length === 0) {
        return {
            ...newState,
            objectsSearchTerms,
            filteredObjects: null,
        };
    }

    const selectedItems = getSelectedItems(
        context,
        getAttributeObjects,
        selectedFilterAttributes,
        strictSelectedFilterAttributes);

    return {
        ...newState,
        objectsSearchTerms,
        filteredObjects: filterItems(context.objects, objectsSearchTerms, selectedItems),
    };
}

/**
 * Calculates the new state for filtered attributes based on search terms 
 * and selected object filters.
 */
function withFilteredAttributes(newState: Partial<ContextStore>, oldState: ContextStore): Partial<ContextStore> {
    const debouncedAttributesSearchInput = withFallback(newState.debouncedAttributesSearchInput, oldState.debouncedAttributesSearchInput);
    const selectedFilterObjects = withFallback(newState.selectedFilterObjects, oldState.selectedFilterObjects);
    const strictSelectedFilterObjects = withFallback(newState.strictSelectedFilterObjects, oldState.strictSelectedFilterObjects);
    const attributesSearchTerms = toSearchTerms(debouncedAttributesSearchInput);
    const context = useDataStructuresStore.getState().context;

    if ((attributesSearchTerms.length === 0 && selectedFilterObjects.length === 0) || !context || context.objects.length === 0) {
        return {
            ...newState,
            attributesSearchTerms,
            filteredAttributes: null,
        };
    }

    const selectedItems = getSelectedItems(
        context,
        getObjectAttributes,
        selectedFilterObjects,
        strictSelectedFilterObjects);

    return {
        ...newState,
        attributesSearchTerms,
        filteredAttributes: filterItems(context.attributes, attributesSearchTerms, selectedItems),
    };
}

/**
 * Core filtering logic: iterates through items and checks against 
 * both search text and selection constraints.
 */
function filterItems(items: ReadonlyArray<string>, searchTerms: ReadonlyArray<string>, selectedItems: ReadonlySet<number>) {
    const filteredItems = new Array<number>();

    for (let item = 0; item < items.length; item++) {
        const search = searchTerms.length === 0 || searchStringFilter(items[item], searchTerms);
        const select = selectedItems.size === 0 || selectedItems.has(item);

        if (search && select) {
            filteredItems.push(item);
        }
    }

    return new Set(filteredItems);
}

/**
 * @param strictFiltering If `true`, performs an intersection (items related to ALL filters).
 * If `false`, performs a union (items related to ANY filter).
 */
function getSelectedItems(
    context: FormalContext,
    contextItems: (context: FormalContext, item: number | ReadonlyArray<number>) => Array<number>,
    filterItems: ReadonlyArray<number>,
    strictFiltering: boolean,
) {
    const selectedItems = new Set<number>();

    if (strictFiltering) {
        contextItems(context, filterItems).forEach((it) => selectedItems.add(it));
    }
    else {
        for (const item of filterItems) {
            contextItems(context, item).forEach((it) => selectedItems.add(it));
        }
    }

    return selectedItems;
}