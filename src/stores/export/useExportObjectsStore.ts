import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportObjectsStore = TextResultExportStore<ContextItemExportFormat>

const useExportObjectsStore = createTextResultStore<ContextItemExportFormat>("json", withNewFormat);

export default useExportObjectsStore;

function withNewFormat(newState: Partial<ExportObjectsStore>, oldState: ExportObjectsStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}