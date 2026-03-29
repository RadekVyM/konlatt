import { w } from "../../utils/stores";

type TextResultSliceState = {
    /** Array of strings representing the computed text segments. */
    result: ReadonlyArray<string> | null,
    /** Mapping of indexes representing collapsible UI regions. */
    collapseRegions: ReadonlyMap<number, number> | null,
    /** Total count of characters in the result. */
    charactersCount: number,
    /** Flag to prevent automatic re-computation of results. */
    disabledComputation: boolean,
}

type TextResultSliceActions = {
    /** Clears the current result and resets metadata. */
    resetResult: () => void,
    /** Manually triggers a re-calculation of the text result. */
    triggerResultComputation: () => void,
    /** Re-enables the computation logic and updates the state. */
    enableComputation: () => void,
}

export type TextResultSlice = TextResultSliceState & TextResultSliceActions

export const initialState: TextResultSliceState = {
    result: null,
    collapseRegions: null,
    disabledComputation: false,
    charactersCount: 0,
};

/**
 * Slice for a Zustand store that manages the computation and storage of text-based export results.
 */
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