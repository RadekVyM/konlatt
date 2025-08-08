import { ContextItemExportFormat } from "../../types/export/ContextItemExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportAttributesStore = TextResultExportStore<ContextItemExportFormat>

const useExportAttributesStore = createTextResultStore<ContextItemExportFormat>("json", withNewFormat);

export default useExportAttributesStore;

function withNewFormat(newState: Partial<ExportAttributesStore>, oldState: ExportAttributesStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}