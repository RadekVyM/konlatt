import { convertToJson } from "../../../services/export/concepts/json";
import { convertToXml } from "../../../services/export/concepts/xml";
import { ConceptLattice } from "../../../types/ConceptLattice";
import { ConceptExportFormat } from "../../../types/export/ConceptExportFormat";
import { FormalConcept, FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { Relation } from "../../../types/Relation";
import { sumLengths } from "../../../utils/array";
import { withFallback } from "../../../utils/stores";
import useDataStructuresStore from "../../useDataStructuresStore";
import useProjectStore from "../../useProjectStore";
import { ExportConceptsStore } from "./ExportConceptsStore";

const TOO_LARGE_THRESHOLD = 15_000_000;

/**
 * Checks if the current export configuration would result 
 * in a payload that is too large for the browser to handle efficiently.
 */
export function withConceptsExportTooLarge(
    newState: Partial<ExportConceptsStore>,
    oldState: ExportConceptsStore,
    sublatticeConceptIndexes: ReadonlyArray<number>,
): Partial<ExportConceptsStore> {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const includeLattice = withFallback(newState.includeLattice, oldState.includeLattice);
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;
    const lattice = useDataStructuresStore.getState().lattice;

    if (!context || !concepts) {
        return newState;
    }

    // Extract the subset of data intended for export
    const { objects, attributes, concepts: conceptsToExport, relation } = highlightedConcepts(
        context,
        concepts,
        sublatticeConceptIndexes,
        includeLattice ? lattice : null);
    // Estimate the number of lines and total characters to avoid freezing the UI
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

/**
 * Computes the final export strings (JSON/XML) based on the current selection and format.
 * This should typically be called after `withConceptsExportTooLarge` has validated the size.
 */
export function withConceptsExportResult(
    newState: Partial<ExportConceptsStore>,
    oldState: ExportConceptsStore,
    sublatticeConceptIndexes: ReadonlyArray<number>,
): Partial<ExportConceptsStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const disabledComputation = newState.disabledComputation !== undefined ? newState.disabledComputation : oldState.disabledComputation;
    const includeLattice = newState.includeLattice !== undefined ? newState.includeLattice : oldState.includeLattice;
    const context = useDataStructuresStore.getState().context;
    const concepts = useDataStructuresStore.getState().concepts;
    const lattice = useDataStructuresStore.getState().lattice;

    // Abort if data is missing or if the computation was flagged as too large
    if (!context || !concepts || disabledComputation) {
        return newState;
    }

    const { objects, attributes, concepts: conceptsToExport, relation } = highlightedConcepts(
        context,
        concepts,
        sublatticeConceptIndexes,
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
        charactersCount: sumLengths(result, 1),
    };
}

/**
 * Returns the average character length per line for a given format based on benchmarked data.
 */
function averageLineLength(format: ConceptExportFormat) {
    // These numbers are experimentally measured on 5 datasets
    switch (format) {
        case "json":
            return 8.530866649111392;
        case "xml":
            return 16.269536151267996;
    }
}

/**
 * Filters and remaps the formal context and concepts based on a selection of indexes.
 * If no indexes are provided, it prepares the entire context for export.
 */
function highlightedConcepts(
    context: FormalContext,
    concepts: FormalConcepts,
    sublatticeConceptIndexes: ReadonlyArray<number>,
    lattice: ConceptLattice | null,
): {
    objects: ReadonlyArray<string>,
    attributes: ReadonlyArray<string>,
    concepts: FormalConcepts,
    relation?: Relation,
} {
    if (sublatticeConceptIndexes.length === 0) {
        return {
            objects: context.objects,
            attributes: context.attributes,
            concepts,
            relation: lattice ?
                lattice.superconceptsRelation :
                undefined,
        };
    }

    const objectsMapping = new Map<number, number>();
    const attributesMapping = new Map<number, number>();
    const conceptIndexesMapping = new Map<number, number>();
    const newConcepts = new Array<FormalConcept>();

    // Remap local indexes so the exported subset starts from 0
    for (let i = 0; i < sublatticeConceptIndexes.length; i++) {
        const conceptIndex = sublatticeConceptIndexes[i];
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
            remappedRelation(newConcepts, sublatticeConceptIndexes, lattice.superconceptsRelation, conceptIndexesMapping) :
            undefined,
    };
}

/**
 * Maps the cover relation to the new remapped concept indexes.
 */
function remappedRelation(
    newConcepts: ReadonlyArray<FormalConcept>,
    sublatticeConceptIndexes: ReadonlyArray<number>,
    coverRelation: Relation,
    conceptIndexesMapping: Map<number, number>,
) {
    const newCoverRelation = new Array<ReadonlySet<number>>(newConcepts.length);

    for (let i = 0; i < sublatticeConceptIndexes.length; i++) {
        const conceptIndex = sublatticeConceptIndexes[i];
        const set = coverRelation[conceptIndex];

        newCoverRelation[conceptIndexesMapping.get(conceptIndex)!] = new Set(remappedSet(set, conceptIndexesMapping));
    }

    return newCoverRelation;
}

/**
 * Maps original item IDs to new sequential IDs used in the exported subset.
 */
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

function* remappedSet(set: ReadonlySet<number>, mapping: Map<number, number>) {
    for (const value of set) {
        const mappedValue = mapping.get(value);

        if (mappedValue !== undefined) {
            yield mapping.get(value)!;
        }
    }
}