import { create } from "zustand";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import useDataStructuresStore from "../useDataStructuresStore";
import { convertToJson } from "../../services/export/context-item/json";
import { convertToXml } from "../../services/export/context-item/xml";
import { convertToCsv } from "../../services/export/context-item/csv";
import useContextStore from "../useContextStore";
import { getObjectAttributes } from "../../types/FormalContext";
import { sumLengths } from "../../utils/array";
import { withFallback } from "../../utils/stores";

type ExportObjectStore = TextResultExportStore<ContextItemExportFormat>

const useExportObjectStore = create<ExportObjectStore>((set) => ({
    ...createTextResultStoreBaseSlice<ContextItemExportFormat, ExportObjectStore>(
        "json",
        {},
        set,
        withResult),
}));

export default useExportObjectStore;

function withResult(newState: Partial<ExportObjectStore>, oldState: ExportObjectStore) {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const context = useDataStructuresStore.getState().context;
    const selectedObject = useContextStore.getState().selectedObject;

    if (!context || selectedObject === null) {
        return newState;
    }

    const objectName = context.objects[selectedObject];
    const attributes = getObjectAttributes(context, selectedObject).map((attribute) => context.attributes[attribute]);

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "json":
            ({ lines: result, collapseRegions } = convertToJson(
                attributes,
                objectName,
                "object"));
            break;
        case "xml":
            ({ lines: result, collapseRegions } = convertToXml(
                attributes,
                objectName,
                "object"));
            break;
        case "csv":
            result = convertToCsv(attributes);
            break;
    }

    return {
        ...newState,
        result,
        charactersCount: sumLengths(result, 1),
        collapseRegions,
    };
}