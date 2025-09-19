import { create } from "zustand";
import { convertToJson } from "../../services/export/concepts/json";
import { ConceptExportFormat } from "../../types/export/ConceptExportFormat";
import useDataStructuresStore from "../useDataStructuresStore";
import createTextResultStoreBaseSlice, { TextResultExportStore } from "./createTextResultStoreBaseSlice";
import { convertToXml } from "../../services/export/concepts/xml";
import { sumLengths } from "../../utils/array";
import useProjectStore from "../useProjectStore";
import { w } from "../../utils/stores";
import { FormalContext } from "../../types/FormalContext";
import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import useDiagramStore from "../diagram/useDiagramStore";
import { ConceptLattice } from "../../types/ConceptLattice";

const TOO_LARGE_THRESHOLD = 15_000_000;

type ExportConceptsStoreState = {
    includeHighlightedConceptsOnly: boolean,
    includeLattice: boolean,
}

type ExportConceptsStoreActions = {
    setIncludeHighlightedConceptsOnly: React.Dispatch<React.SetStateAction<boolean>>,
    setIncludeLattice: React.Dispatch<React.SetStateAction<boolean>>,
}

type ExportConceptsStore = TextResultExportStore<ConceptExportFormat> & ExportConceptsStoreState & ExportConceptsStoreActions

const initialState: ExportConceptsStoreState = {
    includeHighlightedConceptsOnly: true,
    includeLattice: false,
};

const useExportConceptsStore = create<ExportConceptsStore>((set) => ({
    ...initialState,
    setIncludeHighlightedConceptsOnly: (includeHighlightedConceptsOnly) => set((old) => w({
        includeHighlightedConceptsOnly: (typeof includeHighlightedConceptsOnly === "function" ?
            includeHighlightedConceptsOnly(old.includeHighlightedConceptsOnly) :
            includeHighlightedConceptsOnly)
    }, old, withTooLarge, withResult)),
    setIncludeLattice: (includeLattice) => set((old) => w({
        includeLattice: (typeof includeLattice === "function" ?
            includeLattice(old.includeLattice) :
            includeLattice)
    }, old, withTooLarge, withResult)),
    ...createTextResultStoreBaseSlice<ConceptExportFormat, ExportConceptsStore>(
        "json",
        { ...initialState },
        set,
        withResult,
        withTooLarge),
}));

export default useExportConceptsStore;

function withTooLarge(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const includeLattice = newState.includeLattice !== undefined ? newState.includeLattice : oldState.includeLattice;
    const includeHighlightedConceptsOnly = newState.includeHighlightedConceptsOnly !== undefined ?
        newState.includeHighlightedConceptsOnly :
        oldState.includeHighlightedConceptsOnly;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;
    const lattice = useDataStructuresStore.getState().lattice;
    // TODO: This should not be dependent on useDiagramStore
    const visibleConceptIndexes = useDiagramStore.getState().visibleConceptIndexes;

    if (!context || !concepts) {
        return newState;
    }

    const { objects, attributes, concepts: conceptsToExport, relation } = highlightedConcepts(
        context,
        concepts,
        includeHighlightedConceptsOnly ? [...(visibleConceptIndexes?.values() || [])] : [],
        includeLattice ? lattice : null);
    const linesCountEstimate = objects.length +
        attributes.length +
        conceptsToExport.reduce((prev, current) => prev + current.objects.length + current.attributes.length + 2, 0) +
        (relation?.reduce((prev, current) => prev + current.size + current.size, 0) || 0);
    const charactersCountEstimate = linesCountEstimate * averageLineLength(selectedFormat);
    const isTooLarge = charactersCountEstimate > TOO_LARGE_THRESHOLD;

    return {
        ...newState,
        disabledComputation: isTooLarge,
    };
}

function withResult(newState: Partial<ExportConceptsStore>, oldState: ExportConceptsStore): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const disabledComputation = newState.disabledComputation !== undefined ? newState.disabledComputation : oldState.disabledComputation;
    const includeLattice = newState.includeLattice !== undefined ? newState.includeLattice : oldState.includeLattice;
    const includeHighlightedConceptsOnly = newState.includeHighlightedConceptsOnly !== undefined ?
        newState.includeHighlightedConceptsOnly :
        oldState.includeHighlightedConceptsOnly;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;
    const lattice = useDataStructuresStore.getState().lattice;
    // TODO: This should not be dependent on useDiagramStore
    const visibleConceptIndexes = useDiagramStore.getState().visibleConceptIndexes;

    if (!context || !concepts || disabledComputation) {
        return newState;
    }

    const { objects, attributes, concepts: conceptsToExport, relation } = highlightedConcepts(
        context,
        concepts,
        includeHighlightedConceptsOnly ? [...(visibleConceptIndexes?.values() || [])] : [],
        includeLattice ? lattice : null);
    const name = useProjectStore.getState().name || "";
    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "json":
            ({ lines: result, collapseRegions } = convertToJson(
                objects,
                attributes,
                conceptsToExport,
                name,
                relation));
            break;
        case "xml":
            ({ lines: result, collapseRegions } = convertToXml(
                objects,
                attributes,
                conceptsToExport,
                name,
                relation));
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

function highlightedConcepts(
    context: FormalContext,
    concepts: FormalConcepts,
    visibleConceptIndexes: ReadonlyArray<number>,
    lattice: ConceptLattice | null,
): {
    objects: ReadonlyArray<string>,
    attributes: ReadonlyArray<string>,
    concepts: FormalConcepts,
    relation?: ReadonlyArray<Set<number>>,
} {
    if (visibleConceptIndexes.length === 0) {
        return {
            objects: context.objects,
            attributes: context.attributes,
            concepts,
            relation: lattice ?
                lattice.superconceptsMapping :
                undefined,
        };
    }

    const objectsMapping = new Map<number, number>();
    const attributesMapping = new Map<number, number>();
    const conceptIndexesMapping = new Map<number, number>();
    const newConcepts = new Array<FormalConcept>();

    for (let i = 0; i < visibleConceptIndexes.length; i++) {
        const conceptIndex = visibleConceptIndexes[i];
        const concept = concepts[conceptIndex];
        const objects = remappedItems(concept.objects, objectsMapping);
        const attributes = remappedItems(concept.attributes, attributesMapping);

        conceptIndexesMapping.set(conceptIndex, i);

        newConcepts.push({
            index: i,
            objects,
            attributes,
        });
    }

    const objects = [...objectsMapping.keys()].map((obj) => context.objects[obj]);
    const attributes = [...attributesMapping.keys()].map((attr) => context.attributes[attr]);

    return {
        objects,
        attributes,
        concepts: newConcepts,
        relation: lattice ?
            remappedRelation(newConcepts, visibleConceptIndexes, lattice.superconceptsMapping, conceptIndexesMapping) :
            undefined,
    };
}

function remappedRelation(
    newConcepts: ReadonlyArray<FormalConcept>,
    visibleConceptIndexes: ReadonlyArray<number>,
    coverRelation: ReadonlyArray<Set<number>>,
    conceptIndexesMapping: Map<number, number>,
) {
    const newCoverRelation = new Array<Set<number>>(newConcepts.length);

    for (let i = 0; i < visibleConceptIndexes.length; i++) {
        const conceptIndex = visibleConceptIndexes[i];
        const set = coverRelation[conceptIndex];

        newCoverRelation[conceptIndexesMapping.get(conceptIndex)!] = new Set(remappedSet(set, conceptIndexesMapping));
    }

    return newCoverRelation;
}

function remappedItems(items: ReadonlyArray<number>, mapping: Map<number, number>) {
    return items.map((item) => {
        let newIndex = mapping.get(item);

        if (newIndex === undefined) {
            newIndex = mapping.size;
            mapping.set(item, newIndex);
        }

        return newIndex;
    });
}

function* remappedSet(set: Set<number>, mapping: Map<number, number>) {
    for (const value of set) {
        const mappedValue = mapping.get(value);

        if (mappedValue !== undefined) {
            yield mapping.get(value)!;
        }
    }
}