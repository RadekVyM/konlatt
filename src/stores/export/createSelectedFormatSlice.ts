type SelectedFormatSliceState<TKey> = {
    selectedFormat: TKey,
}

type SelectedFormatSliceActions<TKey> = {
    setSelectedFormat: React.Dispatch<React.SetStateAction<TKey>>,
}

export type SelectedFormatSlice<TKey> = SelectedFormatSliceState<TKey> & SelectedFormatSliceActions<TKey>

export default function createSelectedFormatSlice<TKey extends string, TStore extends SelectedFormatSlice<TKey>>(
    defaultFormat: TKey,
    set: (partial: SelectedFormatSlice<TKey> | Partial<SelectedFormatSlice<TKey>> | ((state: TStore) => SelectedFormatSlice<TKey> | Partial<SelectedFormatSlice<TKey>>), replace?: false) => void,
    withNewFormat: (newState: Partial<SelectedFormatSlice<TKey>>, oldState: TStore) => Partial<SelectedFormatSlice<TKey>> = defaultWithNewFormat,
): SelectedFormatSlice<TKey> {
    return {
        selectedFormat: defaultFormat,
        setSelectedFormat: (selectedFormat) => set((old) => withNewFormat(typeof selectedFormat === "function" ?
            { selectedFormat: selectedFormat(old.selectedFormat) } :
            { selectedFormat },
            old)),
    };
}

function defaultWithNewFormat<TKey extends string, TStore extends SelectedFormatSlice<TKey>>(newState: Partial<SelectedFormatSlice<TKey>>, _oldState: TStore) {
    return newState;
}