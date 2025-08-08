import { create } from "zustand";
import createSelectedFormatSlice, { SelectedFormatSlice } from "./createSelectedFormatSlice";
import createTextResultSlice, { TextResultSlice, initialState as textResultInitialState } from "./createTextResultSlice";

type TextResultExportStoreState = {
}

type TextResultExportStoreActions = {
    reset: () => void,
}

export type TextResultExportStore<TKey extends string> = TextResultExportStoreState & TextResultExportStoreActions & SelectedFormatSlice<TKey> & TextResultSlice

const initialState: TextResultExportStoreState = {
};

export default function createTextResultStore<TKey extends string>(
    defaultFormat: TKey,
    withNewFormat: (newState: Partial<TextResultExportStore<TKey>>, oldState: TextResultExportStore<TKey>) => Partial<TextResultExportStore<TKey>>,
) {
    return create<TextResultExportStore<TKey>>((set) => ({
        ...initialState,
        ...createTextResultSlice(set, withNewFormat),
        ...createSelectedFormatSlice<TKey, TextResultExportStore<TKey>>(defaultFormat, set, withNewFormat),
        reset: () => set(() => ({
            ...initialState,
            ...textResultInitialState,
            selectedFormat: defaultFormat,
        })),
    }));
}