import { create } from "zustand";
import { convertToJson } from "../../services/export/context-items/json";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import { convertToCsv } from "../../services/export/context-items/csv";
import { convertToXml } from "../../services/export/context-items/xml";
import { sumLengths } from "../../utils/array";
import { withFallback } from "../../utils/stores";

type ExportAttributesStore = TextResultExportStore<ContextItemExportFormat>

const useExportAttributesStore = create<ExportAttributesStore>((set) => ({
    ...createTextResultStoreBaseSlice<ContextItemExportFormat, ExportAttributesStore>(
        "json",
        {},
        set,
        withResult),
}));

export default useExportAttributesStore;

function withResult(newState: Partial<ExportAttributesStore>, oldState: ExportAttributesStore) {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const context = useDataStructuresStore.getState().context;

    if (!context) {
        return newState;
    }

    let result: Array<string> | null = null;

    switch (selectedFormat) {
        case "json":
            result = convertToJson(context.attributes);
            break;
        case "xml":
            result = convertToXml(context.attributes, "attribute");
            break;
        case "csv":
            result = convertToCsv(context.attributes);
            break;
    }

    return {
        ...newState,
        result,
        charactersCount: sumLengths(result, 1),
    };
}