import Module from "../cpp";
import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { FormalConcept, FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import { FormalContext } from "../types/FormalContext";
import { Relation } from "../types/Relation";
import { cppIntMultiArrayToJs, jsArrayToCppSimpleFormalConceptArray, jsArrayToCppUIntArray } from "../utils/cpp";
import { breadthFirstSearch } from "../utils/graphs";
import { assignNodesToLayersByLongestPath } from "./layers";

/**
 * Handles the conversion of formal concepts into a concept lattice.
 * Calls a C++ WebAssembly module to compute the cover relation (edges) between concepts.
 * @param concepts - The list of formal concepts.
 * @param context - The original formal context.
 * @param onProgress - Optional callback to track the computation progress (0.0 to 1.0).
 * @returns A promise containing the computed lattice relations, labelings, and the execution time in milliseconds.
 */
export async function conceptsToLattice(
    concepts: FormalConcepts,
    context: FormalContext,
    onProgress?: (progress: number) => void,
): Promise<{
    lattice: ConceptLattice,
    computationTime: number,
}> {
    const module = await Module();
    const cppConcepts = jsArrayToCppSimpleFormalConceptArray(module, concepts);
    const cppContext = jsArrayToCppUIntArray(module, context.relation);

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

    const superconceptsRelation = [...cppIntMultiArrayToJs(result.value, true)].map((set) => new Set<number>(set));
    const subconceptsRelation = reverseRelation(superconceptsRelation);
    const objectsLabeling = getObjectsLabeling(concepts, superconceptsRelation);
    const attributesLabeling = getAttributesLabeling(concepts, subconceptsRelation);
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
            subconceptsRelation,
            superconceptsRelation,
            objectsLabeling,
            attributesLabeling,
        },
        computationTime,
    };
}

/**
 * Generates the object labeling for the lattice.
 * Objects are assigned to the most specific concept (the "lowest" in the lattice) 
 * that contains them in its extent.
 */
export function getObjectsLabeling(
    concepts: FormalConcepts,
    superconceptsRelation: Relation,
    sublatticeConceptIndexes?: ReadonlySet<number>,
): ConceptLatticeLabeling {
    const infimum = getInfimum(concepts);

    return getLabeling(concepts, infimum, superconceptsRelation, (concept) => concept.objects, sublatticeConceptIndexes);
}

/**
 * Generates the attribute labeling for the lattice.
 * Attributes are assigned to the most general concept (the "highest" in the lattice) 
 * that contains them in its intent.
 */
export function getAttributesLabeling(
    concepts: FormalConcepts,
    subconceptsRelation: Relation,
    sublatticeConceptIndexes?: ReadonlySet<number>,
): ConceptLatticeLabeling {
    const supremum = getSupremum(concepts);

    return getLabeling(concepts, supremum, subconceptsRelation, (concept) => concept.attributes, sublatticeConceptIndexes);
}

/**
 * Calculates the intersection of an upper cone and a lower cone in the lattice.
 * Useful for finding all concepts between two specific concepts.
 * @param upperConeOnlyConceptIndex - The starting index for the upward traversal.
 * @param lowerConeOnlyConceptIndex - The starting index for the downward traversal.
 * @param lattice - The lattice.
 * @returns A `Set` of concept indexes that satisfy the cone constraints, or `null` if no constraints are provided.
 */
export function calculateConeConceptIndexes(
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    lattice: ConceptLattice | null,
) {
    if (upperConeOnlyConceptIndex === null && lowerConeOnlyConceptIndex === null) {
        return null;
    }

    const upperCone = upperConeOnlyConceptIndex !== null && lattice?.superconceptsRelation ?
        collectIndexes(upperConeOnlyConceptIndex, lattice.superconceptsRelation) :
        null;

    const lowerCone = lowerConeOnlyConceptIndex !== null && lattice?.subconceptsRelation ?
        collectIndexes(lowerConeOnlyConceptIndex, lattice.subconceptsRelation) :
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

/**
 * Extracts a sublattice relation based on a subset of concept indexes.
 * Maps the original indexes to a new contiguous range.
 * @param sublatticeConceptIndexes - The set of concept indexes to include in the sublattice.
 * @param lattice - The source concept lattice.
 * @param supremumIndex - The index of the top-most concept to start the layer assignment.
 * @returns An object containing the new subconcept relation and a mapping to original indexes.
 */
export function calculateSublattice(
    sublatticeConceptIndexes: ReadonlySet<number>,
    lattice: ConceptLattice,
    supremumIndex: number,
) {
    const indexMapping = new Map<number, number>();
    const reverseIndexMapping = new Map<number, number>();
    const subconceptsRelation = new Array<ReadonlySet<number>>();
    const { layers } = assignNodesToLayersByLongestPath(supremumIndex, lattice.subconceptsRelation);

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

            for (const subconceptIndex of lattice.subconceptsRelation[conceptIndex]) {
                if (!sublatticeConceptIndexes.has(subconceptIndex)) {
                    continue;
                }

                let index;
                ({ index, nextUsableIndex } = getMappedIndex(indexMapping, reverseIndexMapping, subconceptIndex, nextUsableIndex));

                subconcepts.push(index);
            }

            subconceptsRelation[index] = new Set(subconcepts);

            if (subconcepts.length === 0) {
                infimum = index;
            }
        }
    }

    return {
        reverseIndexMapping,
        subconceptsRelation,
        supremum: 0,
        infimum,
    };
}

function reverseRelation(relation: Relation) {
    const reversedRelation = new Array<Set<number>>(relation.length);

    for (let i = 0; i < relation.length; i++) {
        const children = relation[i];

        for (const child of children) {
            if (reversedRelation[child] === undefined) {
                reversedRelation[child] = new Set<number>();
            }

            reversedRelation[child].add(i);
        }
    }

    for (let i = 0; i < relation.length; i++) {
        if (reversedRelation[i] === undefined) {
            reversedRelation[i] = new Set<number>();
        }
    }

    return reversedRelation;
}

function collectIndexes(startIndex: number, relation: Relation) {
    const set = new Set<number>();

    breadthFirstSearch(startIndex, relation, (index) => set.add(index));

    return set;
}

function getMappedIndex(
    mapping: Map<number, number>,
    reverseIndexMapping: Map<number, number>,
    conceptIndex: number,
    nextUsableIndex: number,
) {
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
    coverRelation: Relation,
    conceptItems: (concept: FormalConcept) => ReadonlyArray<number>,
    sublatticeConceptIndexes?: ReadonlySet<number>,
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