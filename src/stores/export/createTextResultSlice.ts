type TextResultSliceState = {
    result: Array<string> | null,
}

type TextResultSliceActions = {
    resetResult: () => void,
    triggerResultComputation: () => void,
}

export type TextResultSlice = TextResultSliceState & TextResultSliceActions

export const initialState: TextResultSliceState = {
    result: null,
};

export default function createTextResultSlice<TStore extends TextResultSlice>(
    set: (partial: TextResultSlice | Partial<TextResultSlice> | ((state: TStore) => TextResultSlice | Partial<TextResultSlice>), replace?: false) => void,
    withResult: (newState: Partial<TextResultSlice>, oldState: TStore) => Partial<TextResultSlice>,
): TextResultSlice {
    return {
        ...initialState,
        resetResult: () => set({ result: null }),
        triggerResultComputation: () => set((old) => withResult({}, old)),
    };
}