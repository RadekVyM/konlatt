import { create } from "zustand";
import { convertToJson } from "../../services/export/context-items/json";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";

type ExportObjectsStore = TextResultExportStore<ContextItemExportFormat>

const useExportObjectsStore = create<ExportObjectsStore>((set) => ({
    ...createTextResultStoreBaseSlice<ContextItemExportFormat, ExportObjectsStore>(
        "json",
        {},
        set,
        withNewFormat),
}));

export default useExportObjectsStore;

function withNewFormat(newState: Partial<ExportObjectsStore>, oldState: ExportObjectsStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;

    if (!context) {
        return newState;
    }

    let result: Array<string> | null = null;

    switch (selectedFormat) {
        case "json":
            result = convertToJson(context.objects);
            break;
    }

    return {
        ...newState,
        result,
    };
}