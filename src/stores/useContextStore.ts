import { create } from "zustand";
import useDataStructuresStore from "./useDataStructuresStore";
import { searchStringFilter, toSearchTerms } from "../utils/search";
import { ItemSortType } from "../types/SortType";
import { SortDirection } from "../types/SortDirection";

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
    filteredObjects: Set<number> | null,
    selectedAttribute: number | null,
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
    filteredObjects: null,
    selectedAttribute: null,
    filteredAttributes: null,
};

const useContextStore = create<ContextStore>((set) => ({
    ...initialState,
    setDebouncedObjectsSearchInput: (debouncedObjectsSearchInput) => set(() => {
        const objectsSearchTerms = toSearchTerms(debouncedObjectsSearchInput);
        const context = useDataStructuresStore.getState().context;

        if (objectsSearchTerms.length === 0 || !context || context.objects.length === 0) {
            return {
                debouncedObjectsSearchInput,
                objectsSearchTerms,
                filteredObjects: null,
            };
        }

        return {
            debouncedObjectsSearchInput,
            objectsSearchTerms,
            filteredObjects: filterItems(context.objects, objectsSearchTerms),
        };
    }),
    setObjectsSortDirection: (objectsSortDirection) => set({ objectsSortDirection }),
    setObjectsSortType: (objectsSortType) => set({ objectsSortType }),
    setDebouncedAttributesSearchInput: (debouncedAttributesSearchInput) => set(() => {
        const attributesSearchTerms = toSearchTerms(debouncedAttributesSearchInput);
        const context = useDataStructuresStore.getState().context;

        if (attributesSearchTerms.length === 0 || !context || context.objects.length === 0) {
            return {
                debouncedAttributesSearchInput,
                attributesSearchTerms,
                filteredAttributes: null,
            };
        }

        return {
            debouncedAttributesSearchInput,
            attributesSearchTerms,
            filteredAttributes: filterItems(context.attributes, attributesSearchTerms),
        };
    }),
    setAttributesSortDirection: (attributesSortDirection) => set({ attributesSortDirection }),
    setAttributesSortType: (attributesSortType) => set({ attributesSortType }),
    setSelectedObject: (selectedObject) => set(() => ({ selectedObject })),
    setSelectedAttribute: (selectedAttribute) => set(() => ({ selectedAttribute })),
    setSelection: (selectedObject, selectedAttribute) => set(() => ({ selectedObject, selectedAttribute })),
    reset: () => set(() => ({
        ...initialState,
    })),
}));

export default useContextStore;

function filterItems(items: ReadonlyArray<string>, searchTerms: Array<string>) {
    const filteredItems = new Array<number>();

    for (let i = 0; i < items.length; i++) {
        if (searchStringFilter(items[i], searchTerms)) {
            filteredItems.push(i);
        }
    }

    return new Set(filteredItems);
}