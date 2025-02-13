// Based on algorithm used here:
// https://github.com/upriss/fcastone/blob/84742cc23eed9a3b986f6fde3d6476fae3bbd9fe/fcastone#L816

import { IndexedFormalConcept } from "../types/FormalConcept";
import { isSortedSubsetOf } from "../utils/arrays";

export function conceptsToLattice(concepts: Array<IndexedFormalConcept>): Array<Array<i32>> {
    // It is still not usable for lots of concepts – works quite fine with 3000 concepts
    const startTime = Date.now();

    // Concepts must be ordered by intent's length from biggest to smallest
    concepts.sort((first, second) => second.attributes.length - first.attributes.length);

    // lattice[i] = a set of direct subconcepts of a concept concepts[i]
    const lattice: StaticArray<LatticeSet> = new StaticArray<LatticeSet>(concepts.length);
    for (let i = 0; i < concepts.length; i++) {
        lattice[i] = { set: new Set<i32>(), index: concepts[i].index };
    }

    // direct subconcepts of a concept concepts[i]
    const subConcepts: StaticArray<i32> = new StaticArray<i32>(concepts.length);
    let subConceptsCount = 0;

    for (let i = 0; i < concepts.length; i++) {
        subConceptsCount = 0;

        for (let j = i - 1; j >= 0; j--) {
            // j is subconcept of i
            if (isSortedSubsetOf(concepts[i].attributes, concepts[j].attributes)) {
                subConcepts[subConceptsCount] = j;
                subConceptsCount++;
                lattice[i].set.add(j);

                // if one of the subconcepts has j as a direct subconcept, j is not a direct subconcept of i
                // delete transitive links
                for (let k = 0; k < subConceptsCount; k++) {
                    const subConcept = subConcepts[k];
                    if (lattice[subConcept].set.has(j)) {
                        lattice[i].set.delete(j);
                        break;
                    }
                }
            }
        }
    }

    console.log(`lattice: ${Date.now() - startTime} ms`);

    const result = new Array<Array<i32>>(lattice.length);
    
    // Ensure the original order of concepts
    for (let i = 0; i < lattice.length; i++) {
        const value = lattice[i];
        const subconcepts = result[value.index] = value.set.values();
        for (let j = 0; j < subconcepts.length; j++) {
            subconcepts[j] = lattice[subconcepts[j]].index;
        }
    }

    return result;
}

class LatticeSet {
    set: Set<i32> = new Set<i32>();
    index: i32 = -1;
}