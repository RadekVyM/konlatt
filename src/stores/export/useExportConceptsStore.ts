import { create } from "zustand";
import { convertToJson } from "../../services/export/concepts/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";

type ExportConceptsStore = TextResultExportStore<ConceptExportFormat>

const useExportConceptsStore = create<ExportConceptsStore>((set) => ({
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportConceptsStore>(
        "json",
        {},
        set,
        withNewFormat),
}));

export default useExportConceptsStore;

function withNewFormat(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;

    if (!context || !concepts) {
        return newState;
    }

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "json":
            const res = convertToJson(
                context,
                concepts);

            result = res.lines;
            collapseRegions = res.collapseRegions;
            break;
    }

    return {
        ...newState,
        result,
        collapseRegions,
    };
}