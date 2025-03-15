import Module from "../wasm/cpp";
import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { FormalConcept, FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import { RawFormalContext } from "../types/RawFormalContext";
import { cppIntMultiArrayToJs, jsArrayToCppIndexedFormalConceptArray, jsArrayToCppUIntArray } from "../utils/cpp";
import { assignNodesToLayersByLongestPath } from "./layers";

/**
 * 
 * @param concepts 
 * @returns Array of indexes of children of each concept
 */
export async function conceptsToLattice(concepts: FormalConcepts, context: RawFormalContext): Promise<ConceptLattice> {
    const module = await Module();
    const cppConcepts = jsArrayToCppIndexedFormalConceptArray(module, concepts);
    const cppContext = jsArrayToCppUIntArray(module, context.context);

    const result = module.conceptsCover(
        cppConcepts,
        cppContext,
        context.cellSize,
        context.cellsPerObject,
        context.objects.length,
        context.attributes.length);

    console.log(`ConceptsCover: ${result.time}ms`);

    const superconceptsMapping = [...cppIntMultiArrayToJs(result.value, true)].map((set) => new Set<number>(set));
    const subconceptsMapping = reverseMapping(superconceptsMapping);
    const objectsLabeling = getObjectsLabeling(concepts, superconceptsMapping);
    const attributesLabeling = getAttributesLabeling(concepts, subconceptsMapping);

    cppContext.delete();
    for (let i = 0; i < cppConcepts.size(); i++) {
        const value = cppConcepts.get(i)!;
        value.attributes.delete();
        value.objects.delete();
        value.delete();
    }
    cppConcepts.delete();

    return {
        subconceptsMapping,
        superconceptsMapping,
        objectsLabeling,
        attributesLabeling,
    };
}

function reverseMapping(subconceptsMapping: Array<Set<number>>) {
    const superconceptsMapping = new Array<Set<number>>(subconceptsMapping.length);

    for (let i = 0; i < subconceptsMapping.length; i++) {
        const subconcepts = subconceptsMapping[i];

        for (const subconcept of subconcepts) {
            if (superconceptsMapping[subconcept] === undefined) {
                superconceptsMapping[subconcept] = new Set<number>();
            }

            superconceptsMapping[subconcept].add(i);
        }
    }

    for (let i = 0; i < subconceptsMapping.length; i++) {
        if (superconceptsMapping[i] === undefined) {
            superconceptsMapping[i] = new Set<number>();
        }
    }

    return superconceptsMapping;
}

function getObjectsLabeling(concepts: FormalConcepts, superconceptsMapping: ReadonlyArray<Set<number>>): ConceptLatticeLabeling {
    const infimum = getInfimum(concepts);

    return getLabeling(concepts, infimum, superconceptsMapping, (concept) => concept.objects);
}

function getAttributesLabeling(concepts: FormalConcepts, subconceptsMapping: ReadonlyArray<Set<number>>): ConceptLatticeLabeling {
    const supremum = getSupremum(concepts);

    return getLabeling(concepts, supremum, subconceptsMapping, (concept) => concept.attributes);
}

function getLabeling(
    concepts: FormalConcepts,
    startConcept: FormalConcept,
    coverRelation: ReadonlyArray<Set<number>>,
    conceptItems: (concept: FormalConcept) => ReadonlyArray<number>
): ConceptLatticeLabeling {
    const labeling = new Map<number, ReadonlyArray<number>>();
    const alreadyAppeared = new Set<number>();
    const { layers } = assignNodesToLayersByLongestPath(startConcept, coverRelation);

    for (const layer of layers) {
        for (const conceptIndex of layer) {
            const concept = concepts[conceptIndex];
            const labels = new Array<number>();

            for (const item of conceptItems(concept)) {
                if (!alreadyAppeared.has(item)) {
                    alreadyAppeared.add(item);
                    labels.push(item);
                }
            }

            labeling.set(conceptIndex, labels);
        }
    }

    return labeling;
}