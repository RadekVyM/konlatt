import { create } from "zustand";
import { convertToJson } from "../../services/export/concept/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDiagramStore from "../diagram/useDiagramStore";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import { sumLengths } from "../../utils/array";
import { convertToXml } from "../../services/export/concept/xml";

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