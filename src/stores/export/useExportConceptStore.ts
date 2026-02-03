import { create } from "zustand";
import { convertToJson } from "../../services/export/concept/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import { sumLengths } from "../../utils/array";
import { convertToXml } from "../../services/export/concept/xml";
import createSelectedConceptSlice, { SelectedConceptSlice, initialState as initialSelectedConceptSliceState } from "../createSelectedConceptSlice";
import { withFallback } from "../../utils/stores";

type ExportConceptStore = TextResultExportStore<ConceptExportFormat> & SelectedConceptSlice

const useExportConceptStore = create<ExportConceptStore>((set) => ({
    ...createSelectedConceptSlice(set),
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportConceptStore>(
        "json",
        initialSelectedConceptSliceState,
        set,
        withResult),
}));

export default useExportConceptStore;

function withResult(newState: Partial<ExportConceptStore>, oldState: ExportConceptStore) {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const selectedConceptIndex = withFallback(newState.selectedConceptIndex, oldState.selectedConceptIndex);
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;

    if (!context || !concepts || selectedConceptIndex === null) {
        return newState;
    }

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "json":
            ({ lines: result, collapseRegions } = convertToJson(
                context,
                concepts,
                selectedConceptIndex));
            break;
        case "xml":
            ({ lines: result, collapseRegions } = convertToXml(
                context,
                concepts,
                selectedConceptIndex));
            break;
    }

    return {
        ...newState,
        result,
        collapseRegions,
        charactersCount: sumLengths(result),
    };
}