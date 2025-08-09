import { convertToJson } from "../../services/export/context-items/json";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportAttributesStore = TextResultExportStore<ContextItemExportFormat>

const useExportAttributesStore = createTextResultStore<ContextItemExportFormat>("json", withNewFormat);

export default useExportAttributesStore;

function withNewFormat(newState: Partial<ExportAttributesStore>, oldState: ExportAttributesStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;

    if (!context) {
        return newState;
    }

    let result: Array<string> | null = null;

    switch (selectedFormat) {
        case "json":
            result = convertToJson(context.attributes);
            break;
    }

    return {
        ...newState,
        result,
    };
}