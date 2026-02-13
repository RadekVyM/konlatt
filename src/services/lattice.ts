import Module from "../cpp";
import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { FormalConcept, FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import { FormalContext } from "../types/FormalContext";
import { cppIntMultiArrayToJs, jsArrayToCppSimpleFormalConceptArray, jsArrayToCppUIntArray } from "../utils/cpp";
import { breadthFirstSearch } from "../utils/graphs";
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

export function reverseMapping(mapping: Array<Set<number>>) {
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

export function getObjectsLabeling(
    concepts: FormalConcepts,
    superconceptsMapping: ReadonlyArray<Set<number>>,
    sublatticeConceptIndexes?: Set<number>,
): ConceptLatticeLabeling {
    const infimum = getInfimum(concepts);

    return getLabeling(concepts, infimum, superconceptsMapping, (concept) => concept.objects, sublatticeConceptIndexes);
}

export function getAttributesLabeling(
    concepts: FormalConcepts,
    subconceptsMapping: ReadonlyArray<Set<number>>,
    sublatticeConceptIndexes?: Set<number>,
): ConceptLatticeLabeling {
    const supremum = getSupremum(concepts);

    return getLabeling(concepts, supremum, subconceptsMapping, (concept) => concept.attributes, sublatticeConceptIndexes);
}


export function calculateConeConceptIndexes(upperConeOnlyConceptIndex: number | null, lowerConeOnlyConceptIndex: number | null, lattice: ConceptLattice | null) {
    if (upperConeOnlyConceptIndex === null && lowerConeOnlyConceptIndex === null) {
        return null;
    }

    const upperCone = upperConeOnlyConceptIndex !== null && lattice?.superconceptsMapping ?
        collectIndexes(upperConeOnlyConceptIndex, lattice.superconceptsMapping) :
        null;

    const lowerCone = lowerConeOnlyConceptIndex !== null && lattice?.subconceptsMapping ?
        collectIndexes(lowerConeOnlyConceptIndex, lattice.subconceptsMapping) :
        null;

    if (upperCone === null) {
        return lowerCone;
    }
    if (lowerCone === null) {
        return upperCone;
    }

    const smaller = upperCone.size > lowerCone.size ? lowerCone : upperCone;
    const larger = upperCone.size > lowerCone.size ? upperCone : lowerCone;

    const intersection = new Array<number>();

    for (const conceptIndex of larger) {
        if (smaller.has(conceptIndex)) {
            intersection.push(conceptIndex);
        }
    }

    return new Set(intersection);
}

export function calculateSublattice(sublatticeConceptIndexes: Set<number>, lattice: ConceptLattice, supremumIndex: number) {
    const indexMapping = new Map<number, number>();
    const reverseIndexMapping = new Map<number, number>();
    const subconceptsMapping = new Array<Set<number>>();
    const { layers } = assignNodesToLayersByLongestPath(supremumIndex, lattice.subconceptsMapping);

    let infimum = 0;
    let nextUsableIndex = 0;

    for (const layer of layers) {
        for (const conceptIndex of layer) {
            if (!sublatticeConceptIndexes.has(conceptIndex)) {
                continue;
            }

            let index;
            ({ index, nextUsableIndex } = getMappedIndex(indexMapping, reverseIndexMapping, conceptIndex, nextUsableIndex));

            const subconcepts = new Array<number>();

            for (const subconceptIndex of lattice.subconceptsMapping[conceptIndex]) {
                if (!sublatticeConceptIndexes.has(subconceptIndex)) {
                    continue;
                }

                let index;
                ({ index, nextUsableIndex } = getMappedIndex(indexMapping, reverseIndexMapping, subconceptIndex, nextUsableIndex));

                subconcepts.push(index);
            }

            subconceptsMapping[index] = new Set(subconcepts);

            if (subconcepts.length === 0) {
                infimum = index;
            }
        }
    }

    return {
        reverseIndexMapping,
        subconceptsMapping,
        supremum: 0,
        infimum,
    };
}

function collectIndexes(startIndex: number, relation: ReadonlyArray<Set<number>>) {
    const set = new Set<number>();

    breadthFirstSearch(startIndex, relation, (index) => set.add(index));

    return set;
}

function getMappedIndex(mapping: Map<number, number>, reverseIndexMapping: Map<number, number>, conceptIndex: number, nextUsableIndex: number) {
    let index = mapping.get(conceptIndex);

    if (index === undefined) {
        index = nextUsableIndex;
        mapping.set(conceptIndex, index);
        reverseIndexMapping.set(index, conceptIndex);
        nextUsableIndex++;
    }

    return { index, nextUsableIndex };
}

function getLabeling(
    concepts: FormalConcepts,
    startConcept: FormalConcept,
    coverRelation: ReadonlyArray<Set<number>>,
    conceptItems: (concept: FormalConcept) => ReadonlyArray<number>,
    sublatticeConceptIndexes?: Set<number>,
): ConceptLatticeLabeling {
    const labeling = new Map<number, ReadonlyArray<number>>();
    const alreadyAppeared = new Set<number>();
    const { layers } = assignNodesToLayersByLongestPath(startConcept.index, coverRelation);

    for (const layer of layers) {
        for (const conceptIndex of layer) {
            if (sublatticeConceptIndexes && !sublatticeConceptIndexes.has(conceptIndex)) {
                continue;
            }

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