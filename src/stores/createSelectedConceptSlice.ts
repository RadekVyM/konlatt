import { w } from "../utils/stores";

type SelectedConceptSliceState = {
    selectedConceptIndex: number | null,
}

type SelectedConceptSliceActions = {
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}

export type SelectedConceptSlice = SelectedConceptSliceState & SelectedConceptSliceActions

export const initialState: SelectedConceptSliceState = {
    selectedConceptIndex: null,
};

export default function createSelectedConceptSlice<TStore extends SelectedConceptSlice>(
    set: (partial: TStore | Partial<TStore> | ((state: TStore) => TStore | Partial<TStore>), replace?: false) => void,
    withSelectedConceptChanged?: (newState: Partial<TStore>, oldState: TStore) => Partial<TStore>,
): SelectedConceptSlice {
    return {
        ...initialState,
        setSelectedConceptIndex: (selectedConceptIndex) => set((old) => w((typeof selectedConceptIndex === "function" ?
            { selectedConceptIndex: selectedConceptIndex(old.selectedConceptIndex) } :
            { selectedConceptIndex }) as Partial<TStore>, old, withSelectedConceptChanged)),
    };
}