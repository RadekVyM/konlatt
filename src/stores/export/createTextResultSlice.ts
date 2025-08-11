import { w } from "../../utils/stores";

type TextResultSliceState = {
    result: Array<string> | null,
    collapseRegions: Map<number, number> | null,
    charactersCount: number,
    disabledComputation: boolean,
}

type TextResultSliceActions = {
    resetResult: () => void,
    triggerResultComputation: () => void,
    enableComputation: () => void,
}

export type TextResultSlice = TextResultSliceState & TextResultSliceActions

export const initialState: TextResultSliceState = {
    result: null,
    collapseRegions: null,
    disabledComputation: false,
    charactersCount: 0,
};

export default function createTextResultSlice<TStore extends TextResultSlice>(
    set: (partial: TextResultSlice | Partial<TextResultSlice> | ((state: TStore) => TextResultSlice | Partial<TextResultSlice>), replace?: false) => void,
    withResult: (newState: Partial<TextResultSlice>, oldState: TStore) => Partial<TStore>,
    withDisabledComputation?: (newState: Partial<TextResultSlice>, oldState: TStore) => Partial<TStore>,
): TextResultSlice {
    return {
        ...initialState,
        resetResult: () => set({ result: null, collapseRegions: null, charactersCount: 0, }),
        triggerResultComputation: () => set((old) => w({}, old, withDisabledComputation, withResult)),
        enableComputation: () => set((old) => withResult({ disabledComputation: false }, old)),
    };
}