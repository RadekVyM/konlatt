import { convertToBurmeister } from "../../services/export/context/burmeister";
import { convertToCsv } from "../../services/export/context/csv";
import { convertToJson } from "../../services/export/context/json";
import { ContextExportFormat } from "../../types/export/ContextExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import useProjectStore from "../useProjectStore";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportContextStore = TextResultExportStore<ContextExportFormat>

const useExportContextStore = createTextResultStore<ContextExportFormat>("burmeister", withNewFormat);

export default useExportContextStore;

function withNewFormat(newState: Partial<ExportContextStore>, oldState: ExportContextStore): Partial<ExportContextStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;

    if (!context) {
        return newState;
    }

    let result: Array<string> | null = null;

    switch (selectedFormat) {
        case "burmeister":
            result = convertToBurmeister(
                useProjectStore.getState().file?.name || "",
                context);
            break;
        case "json":
            result = convertToJson(
                useProjectStore.getState().file?.name || "",
                context);
            break;
        case "csv":
            result = convertToCsv(context);
            break;
    }

    return {
        ...newState,
        result,
    };
}