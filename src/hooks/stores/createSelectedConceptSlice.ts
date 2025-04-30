export type SelectedConceptSlice = {
    selectedConceptIndex: number | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}

export default function createSelectedConceptSlice(set: (partial: SelectedConceptSlice | Partial<SelectedConceptSlice> | ((state: SelectedConceptSlice) => SelectedConceptSlice | Partial<SelectedConceptSlice>), replace?: false) => void): SelectedConceptSlice {
    return {
        selectedConceptIndex: null,
        setSelectedConceptIndex: (selectedConceptIndex) => {
            if (typeof selectedConceptIndex === "function") {
                set((old) => ({ selectedConceptIndex: selectedConceptIndex(old.selectedConceptIndex) }));
            }
            else {
                set(() => ({ selectedConceptIndex }));
            }
        },
    };
}