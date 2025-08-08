import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportConceptsStore = TextResultExportStore<ConceptExportFormat>

const useExportConceptsStore = createTextResultStore<ConceptExportFormat>("json", withNewFormat);

export default useExportConceptsStore;

function withNewFormat(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;

    console.log(selectedFormat)

    return newState;
}