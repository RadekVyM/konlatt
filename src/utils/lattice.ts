import { assignNodesToLayersByLongestPath } from "../services/layers";
import { ConceptLattice } from "../types/ConceptLattice";
import { breadthFirstSearch } from "./graphs";

export function calculateVisibleConceptIndexes(upperConeOnlyConceptIndex: number | null, lowerConeOnlyConceptIndex: number | null, lattice: ConceptLattice | null) {
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

export function calculateSublattice(visibleConceptIndexes: Set<number>, lattice: ConceptLattice, supremumIndex: number) {
    const indexMapping = new Map<number, number>();
    const subconceptsMapping = new Array<Set<number>>();
    const { layers } = assignNodesToLayersByLongestPath(supremumIndex, lattice.subconceptsMapping);

    let nextUsableIndex = 0;

    for (const layer of layers) {
        for (const conceptIndex of layer) {
            if (!visibleConceptIndexes.has(conceptIndex)) {
                continue;
            }

            let index;
            ({ index, nextUsableIndex } = getMappedIndex(indexMapping, conceptIndex, nextUsableIndex));

            const subconcepts = new Array<number>();

            for (const subconceptIndex of lattice.subconceptsMapping[conceptIndex]) {
                if (!visibleConceptIndexes.has(subconceptIndex)) {
                    continue;
                }

                let index;
                ({ index, nextUsableIndex } = getMappedIndex(indexMapping, subconceptIndex, nextUsableIndex));

                subconcepts.push(index);
            }

            subconceptsMapping[index] = new Set(subconcepts);
        }
    }

    return {
        indexMapping,
        subconceptsMapping,
        supremum: 0,
    };
}

function collectIndexes(startIndex: number, relation: ReadonlyArray<Set<number>>) {
    const set = new Set<number>();

    breadthFirstSearch(startIndex, relation, (index) => set.add(index));

    return set;
}

function getMappedIndex(mapping: Map<number, number>, conceptIndex: number, nextUsableIndex: number) {
    let index = mapping.get(conceptIndex);

    if (index === undefined) {
        index = nextUsableIndex;
        mapping.set(conceptIndex, index);
        nextUsableIndex++;
    }

    return { index, nextUsableIndex };
}