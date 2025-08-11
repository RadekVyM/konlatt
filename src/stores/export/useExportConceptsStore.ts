import { create } from "zustand";
import { convertToJson } from "../../services/export/concepts/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import { convertToXml } from "../../services/export/concepts/xml";
import { sumLengths } from "../../utils/array";

const TOO_LARGE_THRESHOLD = 15_000_000;

type ExportConceptsStore = TextResultExportStore<ConceptExportFormat>

const useExportConceptsStore = create<ExportConceptsStore>((set) => ({
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportConceptsStore>(
        "json",
        {},
        set,
        withNewFormat,
        withTooLarge),
}));

export default useExportConceptsStore;

function withTooLarge(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;

    if (!context || !concepts) {
        return newState;
    }

    const linesCountEstimate = context.objects.length +
        context.attributes.length +
        concepts.reduce((prev, current) => prev + current.objects.length + current.attributes.length + 2, 0);
    const charactersCountEstimate = linesCountEstimate * averageLineLength(selectedFormat);
    const isTooLarge = charactersCountEstimate > TOO_LARGE_THRESHOLD;

    return {
        ...newState,
        disabledComputation: isTooLarge,
    };
}

function withNewFormat(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const disabledComputation = newState.disabledComputation !== undefined ? newState.disabledComputation : oldState.disabledComputation;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;

    if (!context || !concepts || disabledComputation) {
        return newState;
    }

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "json":
            ({ lines: result, collapseRegions } = convertToJson(
                context,
                concepts));
            break;
        case "xml":
            ({ lines: result, collapseRegions } = convertToXml(
                context,
                concepts));
            break;
    }

    return {
        ...newState,
        result,
        collapseRegions,
        charactersCount: sumLengths(result),
    };
}

function averageLineLength(format: ConceptExportFormat) {
    // These numbers are experimentally measured on 5 datasets
    switch (format) {
        case "json":
            return 8.88;
        case "xml":
            return 15.88;
    }
}