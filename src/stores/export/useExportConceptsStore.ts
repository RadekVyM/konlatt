import { convertToJson } from "../../services/export/concepts/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStore, { TextResultExportStore } from "./createTextResultStore";

type ExportConceptsStore = TextResultExportStore<ConceptExportFormat>

const useExportConceptsStore = createTextResultStore<ConceptExportFormat>("json", withNewFormat);

export default useExportConceptsStore;

function withNewFormat(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;

    if (!context || !concepts) {
        return newState;
    }

    let result: Array<string> | null = null;

    switch (selectedFormat) {
        case "json":
            result = convertToJson(
                context,
                concepts);
            break;
    }

    return {
        ...newState,
        result,
    };
}