import { create } from "zustand";
import { convertToBurmeister } from "../../services/export/context/burmeister";
import { convertToCsv } from "../../services/export/context/csv";
import { convertToJson } from "../../services/export/context/json";
import { ContextExportFormat } from "../../types/export/ContextExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import useProjectStore from "../useProjectStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import { CsvSeparator } from "../../types/CsvSeparator";

type ExportContextStoreState = {
    csvSeparator: CsvSeparator,
}

type ExportContextStoreActions = {
    setCsvSeparator: (csvSeparator: CsvSeparator) => void,
}

type ExportContextStore = TextResultExportStore<ContextExportFormat> & ExportContextStoreState & ExportContextStoreActions

const initialState: ExportContextStoreState = {
    csvSeparator: ",",
};

const useExportContextStore = create<ExportContextStore>((set) => ({
    ...initialState,
    setCsvSeparator: (csvSeparator) => set((old) => withNewFormat({ csvSeparator }, old)),
    ...createTextResultStoreBaseSlice<ContextExportFormat, ExportContextStore>(
        "burmeister",
        initialState,
        set,
        withNewFormat),
}));

export default useExportContextStore;

function withNewFormat(newState: Partial<ExportContextStore>, oldState: ExportContextStore): Partial<ExportContextStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const csvSeparator = newState.csvSeparator !== undefined ? newState.csvSeparator : oldState.csvSeparator;
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
            result = convertToCsv(context, csvSeparator);
            break;
    }

    return {
        ...newState,
        result,
    };
}