import { create } from "zustand";
import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import useDataStructuresStore from "../useDataStructuresStore";
import useContextStore from "../useContextStore";
import { getAttributeObjects } from "../../types/FormalContext";
import { convertToCsv } from "../../services/export/context-item/csv";
import { convertToXml } from "../../services/export/context-item/xml";
import { convertToJson } from "../../services/export/context-item/json";
import { sumLengths } from "../../utils/array";

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
    const context = useDataStructuresStore.getState().context;
    const selectedAttribute = useContextStore.getState().selectedAttribute;

    if (!context || selectedAttribute === null) {
        return newState;
    }

    const attributeName = context.attributes[selectedAttribute];
    const objects = getAttributeObjects(context, selectedAttribute).map((object) => context.objects[object]);

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "json":
            ({ lines: result, collapseRegions } = convertToJson(
                objects,
                attributeName,
                "attribute"));
            break;
        case "xml":
            ({ lines: result, collapseRegions } = convertToXml(
                objects,
                attributeName,
                "attribute"));
            break;
        case "csv":
            result = convertToCsv(objects);
            break;
    }

    return {
        ...newState,
        result,
        charactersCount: sumLengths(result),
        collapseRegions,
    };
}