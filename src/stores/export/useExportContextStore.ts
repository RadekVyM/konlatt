import { ContextExportFormat } from "../../types/export/ContextExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportContextStore = TextResultExportStore<ContextExportFormat>

const useExportContextStore = createTextResultStore<ContextExportFormat>("burmeister", withNewFormat);

export default useExportContextStore;

function withNewFormat(newState: Partial<ExportContextStore>, oldState: ExportContextStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}