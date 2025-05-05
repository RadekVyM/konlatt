import { create } from "zustand";

type ContextStoreState = {
    selectedObject: number | null,
    selectedAttribute: number | null,
}

type ContextStoreActions = {
    setSelectedObject: (selectedObject: number | null) => void,
    setSelectedAttribute: (selectedAttribute: number | null) => void,
    setSelection: (selectedObject: number | null, selectedAttribute: number | null) => void,
    reset: () => void,
}

type ContextStore = ContextStoreState & ContextStoreActions

const initialState: ContextStoreState = {
    selectedObject: null,
    selectedAttribute: null,
};

const useContextStore = create<ContextStore>((set) => ({
    ...initialState,
    setSelectedObject: (selectedObject) => set(() => ({ selectedObject })),
    setSelectedAttribute: (selectedAttribute) => set(() => ({ selectedAttribute })),
    setSelection: (selectedObject, selectedAttribute) => set(() => ({ selectedObject, selectedAttribute })),
    reset: () => set(() => ({
        ...initialState,
    })),
}));

export default useContextStore;