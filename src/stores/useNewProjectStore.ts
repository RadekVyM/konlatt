import { create } from "zustand";
import { DialogState } from "../types/DialogState";

type NewProjectStore = {
    selectedFile: File | null | undefined,
    dialogState: DialogState | null,
    setSelectedFile: (file: File | null | undefined) => void,
    setDialogState: (dialogState: DialogState) => void,
}

const useNewProjectStore = create<NewProjectStore>((set) => ({
    selectedFile: null,
    dialogState: null,
    setSelectedFile: (selectedFile) => set(() => ({ selectedFile })),
    setDialogState: (dialogState) => set(() => ({ dialogState })),
}));

export default useNewProjectStore;