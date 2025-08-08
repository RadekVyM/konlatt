import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportConceptStore = TextResultExportStore<ConceptExportFormat>

const useExportConceptStore = createTextResultStore<ConceptExportFormat>("json", withNewFormat);

export default useExportConceptStore;

function withNewFormat(newState: Partial<ExportConceptStore>, oldState: ExportConceptStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}