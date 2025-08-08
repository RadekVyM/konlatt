import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportAttributeStore = TextResultExportStore<ContextItemExportFormat>

const useExportAttributeStore = createTextResultStore<ContextItemExportFormat>("json", withNewFormat);

export default useExportAttributeStore;

function withNewFormat(newState: Partial<ExportAttributeStore>, oldState: ExportAttributeStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}