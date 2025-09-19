import Module from "../cpp";
import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { FormalConcept, FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import { FormalContext } from "../types/FormalContext";
import { cppIntMultiArrayToJs, jsArrayToCppSimpleFormalConceptArray, jsArrayToCppUIntArray } from "../utils/cpp";
import { assignNodesToLayersByLongestPath } from "./layers";

/**
 * 
 * @param concepts 
 * @returns Array of indexes of children of each concept
 */
export async function conceptsToLattice(concepts: FormalConcepts, context: FormalContext, onProgress?: (progress: number) => void): Promise<{
    lattice: ConceptLattice,
    computationTime: number,
}> {
    const module = await Module();
    const cppConcepts = jsArrayToCppSimpleFormalConceptArray(module, concepts);
    const cppContext = jsArrayToCppUIntArray(module, context.context);

    const result = new module.IntMultiArrayTimedResult();

    module.conceptsCover(
        result,
        cppConcepts,
        cppContext,
        context.cellSize,
        context.cellsPerObject,
        context.objects.length,
        context.attributes.length,
        onProgress);

    console.log(`ConceptsCover: ${result.time}ms`);

    const superconceptsMapping = [...cppIntMultiArrayToJs(result.value, true)].map((set) => new Set<number>(set));
    const subconceptsMapping = reverseMapping(superconceptsMapping);
    const objectsLabeling = getObjectsLabeling(concepts, superconceptsMapping);
    const attributesLabeling = getAttributesLabeling(concepts, subconceptsMapping);
    const computationTime = result.time;

    cppContext.delete();
    for (let i = 0; i < cppConcepts.size(); i++) {
        const value = cppConcepts.get(i)!;
        value.attributes.delete();
        value.objects.delete();
        value.delete();
    }
    cppConcepts.delete();
    result.delete();

    return {
        lattice: {
            subconceptsMapping,
            superconceptsMapping,
            objectsLabeling,
            attributesLabeling,
        },
        computationTime,
    };
}

function reverseMapping(mapping: Array<Set<number>>) {
    const reversedMapping = new Array<Set<number>>(mapping.length);

    for (let i = 0; i < mapping.length; i++) {
        const items = mapping[i];

        for (const item of items) {
            if (reversedMapping[item] === undefined) {
                reversedMapping[item] = new Set<number>();
            }

            reversedMapping[item].add(i);
        }
    }

    for (let i = 0; i < mapping.length; i++) {
        if (reversedMapping[i] === undefined) {
            reversedMapping[i] = new Set<number>();
        }
    }

    return reversedMapping;
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
    const { layers } = assignNodesToLayersByLongestPath(startConcept.index, coverRelation);

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