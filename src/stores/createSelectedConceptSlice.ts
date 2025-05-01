type SelectedConceptSliceState = {
    selectedConceptIndex: number | null,
}

type SelectedConceptSliceActions = {
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}

export type SelectedConceptSlice = SelectedConceptSliceState & SelectedConceptSliceActions

export const initialState: SelectedConceptSliceState = {
    selectedConceptIndex: null,
}

export default function createSelectedConceptSlice(set: (partial: SelectedConceptSlice | Partial<SelectedConceptSlice> | ((state: SelectedConceptSlice) => SelectedConceptSlice | Partial<SelectedConceptSlice>), replace?: false) => void): SelectedConceptSlice {
    return {
        ...initialState,
        setSelectedConceptIndex: (selectedConceptIndex) => set((old) => typeof selectedConceptIndex === "function" ?
            { selectedConceptIndex: selectedConceptIndex(old.selectedConceptIndex) } :
            { selectedConceptIndex }),
    };
}