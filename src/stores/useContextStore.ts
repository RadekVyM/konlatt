import { create } from "zustand";
import useDataStructuresStore from "./useDataStructuresStore";
import { searchStringFilter, toSearchTerms } from "../utils/search";
import { ItemSortType } from "../types/SortType";
import { SortDirection } from "../types/SortDirection";
import { FormalContext, getAttributeObjects } from "../types/FormalContext";

type ContextStoreState = {
    debouncedObjectsSearchInput: string,
    objectsSearchTerms: Array<string>,
    objectsSortType: ItemSortType,
    objectsSortDirection: SortDirection,
    debouncedAttributesSearchInput: string,
    attributesSearchTerms: Array<string>,
    attributesSortType: ItemSortType,
    attributesSortDirection: SortDirection,
    selectedObject: number | null,
    selectedFilterAttributes: ReadonlyArray<number>,
    filteredObjects: Set<number> | null,
    selectedAttribute: number | null,
    selectedFilterObjects: ReadonlyArray<number>,
    filteredAttributes: Set<number> | null,
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
    setSelectedFilterAttributes: (selectedFilterAttributes: ReadonlyArray<number>) => void,
    setSelectedFilterObjects: (selectedFilterObjects: ReadonlyArray<number>) => void,
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
    selectedFilterAttributes: [],
    filteredObjects: null,
    selectedAttribute: null,
    selectedFilterObjects: [],
    filteredAttributes: null,
};

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
    setSelectedFilterAttributes: (selectedFilterAttributes: ReadonlyArray<number>) => set((old) => withFilteredObjects({ selectedFilterAttributes }, old)),
    setSelectedFilterObjects: (selectedFilterObjects: ReadonlyArray<number>) => set((old) => withFilteredAttributes({ selectedFilterObjects }, old)),
    reset: () => set(() => ({
        ...initialState,
    })),
}));

export default useContextStore;

function withFilteredObjects(newState: Partial<ContextStore>, oldState: ContextStore): Partial<ContextStore> {
    const debouncedObjectsSearchInput = newState.debouncedObjectsSearchInput !== undefined ?
        newState.debouncedObjectsSearchInput :
        oldState.debouncedObjectsSearchInput;
    const selectedFilterAttributes = newState.selectedFilterAttributes !== undefined ?
        newState.selectedFilterAttributes :
        oldState.selectedFilterAttributes;
    const objectsSearchTerms = toSearchTerms(debouncedObjectsSearchInput);
    const context = useDataStructuresStore.getState().context;

    if ((objectsSearchTerms.length === 0 && selectedFilterAttributes.length === 0) || !context || context.objects.length === 0) {
        return {
            ...newState,
            objectsSearchTerms,
            filteredObjects: null,
        };
    }

    const selectedItems = getSelectedItems(context, getAttributeObjects, selectedFilterAttributes);

    return {
        ...newState,
        objectsSearchTerms,
        filteredObjects: filterItems(context.objects, objectsSearchTerms, selectedItems),
    };
}

function withFilteredAttributes(newState: Partial<ContextStore>, oldState: ContextStore): Partial<ContextStore> {
    const debouncedAttributesSearchInput = newState.debouncedAttributesSearchInput !== undefined ?
        newState.debouncedAttributesSearchInput :
        oldState.debouncedAttributesSearchInput;
    const selectedFilterObjects = newState.selectedFilterObjects !== undefined ?
        newState.selectedFilterObjects :
        oldState.selectedFilterObjects;
    const attributesSearchTerms = toSearchTerms(debouncedAttributesSearchInput);
    const context = useDataStructuresStore.getState().context;

    if ((attributesSearchTerms.length === 0 && selectedFilterObjects.length === 0) || !context || context.objects.length === 0) {
        return {
            ...newState,
            attributesSearchTerms,
            filteredAttributes: null,
        };
    }

    const selectedItems = getSelectedItems(context, getAttributeObjects, selectedFilterObjects);

    return {
        ...newState,
        attributesSearchTerms,
        filteredAttributes: filterItems(context.attributes, attributesSearchTerms, selectedItems),
    };
}

function filterItems(items: ReadonlyArray<string>, searchTerms: Array<string>, selectedItems: Set<number>) {
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

function getSelectedItems(
    context: FormalContext,
    contextItems: (context: FormalContext, item: number) => Array<number>,
    filterItems: ReadonlyArray<number>,
) {
    const selectedItems = new Set<number>();

    for (const item of filterItems) {
        contextItems(context, item).forEach((it) => selectedItems.add(it));
    }

    return selectedItems;
}