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

export default function createTextResultStoreBaseSlice<
    TKey extends string,
    TStore extends TextResultExportStore<TKey>,
    TStoreOnly = Pick<TStore, Exclude<keyof TStore, keyof TextResultExportStore<TKey>>>,
>(
    defaultFormat: TKey,
    extraInitialState: Partial<TStoreOnly>,
    set: (partial: TextResultExportStore<TKey> | Partial<TextResultExportStore<TKey>> | ((state: TStore) => TextResultExportStore<TKey> | Partial<TextResultExportStore<TKey>>), replace?: false) => void,
    withResult: (
        newState: Partial<TextResultExportStore<TKey>>,
        oldState: TStore) =>
            Partial<TStore>,
    withDisabledComputation?: (newState: Partial<TextResultExportStore<TKey>>, oldState: TStore) => Partial<TStore>,
): TextResultExportStore<TKey> {
    return {
        ...initialState,
        ...textResultInitialState,
        ...createTextResultSlice<TStore>(set, withResult, withDisabledComputation),
        ...createSelectedFormatSlice<TKey, TStore>(defaultFormat, set, withResult, withDisabledComputation),
        reset: () => set({
            ...initialState,
            ...textResultInitialState,
            ...extraInitialState,
            selectedFormat: defaultFormat,
        }),
    };
}