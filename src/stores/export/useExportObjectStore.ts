import { create } from "zustand";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";

type ExportObjectStore = TextResultExportStore<ContextItemExportFormat>

const useExportObjectStore = create<ExportObjectStore>((set) => ({
    ...createTextResultStoreBaseSlice<ContextItemExportFormat, ExportObjectStore>(
        "json",
        {},
        set,
        withNewFormat),
}));

export default useExportObjectStore;

function withNewFormat(newState: Partial<ExportObjectStore>, oldState: ExportObjectStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}