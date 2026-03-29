import { CsvSeparator } from "../../types/CsvSeparator";

type CsvSliceState = {
    csvSeparator: CsvSeparator,
}

type CsvSliceActions = {
    setCsvSeparator: (csvSeparator: CsvSeparator) => void,
}

export type CsvSlice = CsvSliceState & CsvSliceActions

export const initialState: CsvSliceState = {
    csvSeparator: ",",
};

/**
 * Slice for a Zustand store that manages CSV configuration settings, 
 * specifically the preferred column separator.
 */
export default function createCsvSlice<TStore extends CsvSlice>(
    set: (partial: CsvSlice | Partial<CsvSlice> | ((state: TStore) => CsvSlice | Partial<CsvSlice>), replace?: false) => void,
    withResult: (newState: Partial<CsvSlice>, oldState: TStore) => Partial<TStore>,
): CsvSlice {
    return {
        ...initialState,
        setCsvSeparator: (csvSeparator) => set((old) => withResult({ csvSeparator }, old)),
    };
}