import { create } from "zustand";
import { DialogState } from "../types/DialogState";

type NewProjectStore = {
    selectedFile: File | null | undefined,
    dialogState: DialogState | null,
    setSelectedFile: (file: File | null | undefined) => void,
    setDialogState: (dialogState: DialogState) => void,
}

/** Manages state related to the new project dialog. */
const useNewProjectStore = create<NewProjectStore>((set) => ({
    selectedFile: null,
    dialogState: null,
    setSelectedFile: (selectedFile) => set({ selectedFile }),
    setDialogState: (dialogState) => set({ dialogState }),
}));

export default useNewProjectStore;