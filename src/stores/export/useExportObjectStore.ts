import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportObjectStore = TextResultExportStore<ContextItemExportFormat>

const useExportObjectStore = createTextResultStore<ContextItemExportFormat>("json", withNewFormat);

export default useExportObjectStore;

function withNewFormat(newState: Partial<ExportObjectStore>, oldState: ExportObjectStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}