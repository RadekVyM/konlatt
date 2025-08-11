import { create } from "zustand";
import createSelectedFormatSlice, { SelectedFormatSlice } from "./createSelectedFormatSlice";
import { DiagramExportFormat } from "../../types/export/DiagramExportFormat";

type ExportDiagramStoreState = {
}

type ExportDiagramStoreActions = {
    reset: () => void,
}

type ExportDiagramStore = ExportDiagramStoreState & ExportDiagramStoreActions & SelectedFormatSlice<DiagramExportFormat>

const initialState: ExportDiagramStoreState = {
};

const useExportDiagramStore = create<ExportDiagramStore>((set) => ({
    ...initialState,
    ...createSelectedFormatSlice<DiagramExportFormat, ExportDiagramStore>("svg", set),
    reset: () => set(() => ({
        ...initialState,
    })),
}));

export default useExportDiagramStore;