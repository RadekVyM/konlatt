import { create } from "zustand";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";

type ExportAttributeStore = TextResultExportStore<ContextItemExportFormat>

const useExportAttributeStore = create<ExportAttributeStore>((set) => ({
    ...createTextResultStoreBaseSlice<ContextItemExportFormat, ExportAttributeStore>(
        "json",
        {},
        set,
        withNewFormat),
}));

export default useExportAttributeStore;

function withNewFormat(newState: Partial<ExportAttributeStore>, oldState: ExportAttributeStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}