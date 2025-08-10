import { create } from "zustand";
import { convertToJson } from "../../services/export/concept/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDiagramStore from "../diagram/useDiagramStore";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";

type ExportConceptStore = TextResultExportStore<ConceptExportFormat>

const useExportConceptStore = create<ExportConceptStore>((set) => ({
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportConceptStore>(
        "json",
        {},
        set,
        withNewFormat),
}));

export default useExportConceptStore;

function withNewFormat(newState: Partial<ExportConceptStore>, oldState: ExportConceptStore) {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;
    const selectedConceptIndex = useDiagramStore.getState().selectedConceptIndex;

    if (!context || !concepts || selectedConceptIndex === null) {
        return newState;
    }

    let result: Array<string> | null = null;

    switch (selectedFormat) {
        case "json":
            result = convertToJson(
                context,
                concepts,
                selectedConceptIndex);
            break;
    }

    return {
        ...newState,
        result,
    };
}