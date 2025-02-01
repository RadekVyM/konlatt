// Based on code used here: https://upriss.github.io/educaJS/binaryRelations/binRel.html?ttype=lattice&rtype=fca&graph=%7B%5Bgreen%2Cblue%5D%2C%20%5Borange%2Cred%5D%2C%20%5Bgreen%2Cblue%5D%2C%20%5Borange%2Cyellow%5D%2C%20%5Bviolet%2Cblue%5D%2C%20%5Bviolet%2Cred%5D%2C%20%5Bgreen%2Cyellow%5D%7D%20%0A

import { FormalConcept } from "../types/FormalConcept";
import { isSortedSubsetOf } from "../utils/arrays";

export function conceptsToLattice(concepts: Array<FormalConcept>): Array<Array<i32>> {
    // It is still not usable for lots of concepts – works quite fine with 3000 concepts
    const startTime = Date.now();

    // Remember the original index of each concept
    for (let i = 0; i < concepts.length; i++) {
        concepts[i].attribute = i;
    }

    // Concepts must be ordered by intent's length from biggest to smallest
    concepts.sort((first, second) => second.attributes.length - first.attributes.length);

    // lattice[i] = a set of direct subconcepts of a concept concepts[i]
    const lattice: StaticArray<LatticeSet> = new StaticArray<LatticeSet>(concepts.length);
    for (let i = 0; i < concepts.length; i++) {
        lattice[i] = { set: new Set<i32>(), index: concepts[i].attribute };
    }

    for (let i = 0; i < concepts.length; i++) {
        // (direct) subconcepts of a concept concepts[i]
        const subConcepts: Array<i32> = new Array<i32>();

        for (let j = i - 1; j >= 0; j--) {
            // j is subconcept of i
            if (isSortedSubsetOf(concepts[i].attributes, concepts[j].attributes)) {
                subConcepts.push(j);
                //lattice.add(`${i}>${j}`);
                lattice[i].set.add(j);

                // if one of the subconcepts has j as a subconcept, j is not a subconcept of i
                for (let k = 0; k < subConcepts.length; k++) { // delete transitive links
                    const subConcept = subConcepts[k];
                    //if (lattice.has(`${superConcepts[k]}>${j}`)) {
                    if (lattice[subConcept].set.has(j)) {
                        lattice[i].set.delete(j);
                        //lattice.delete(`${i}>${j}`);
                        break;
                    }
                }
            }
        }
    }

    console.log(`lattice: ${Date.now() - startTime} ms`);

    // Ensure the original order of concepts
    lattice.sort((first, second) => first.index - second.index);
    return lattice.map<Array<i32>>((set) => set.set.values());
}

class LatticeSet {
    set: Set<i32> = new Set<i32>();
    index: i32 = -1;
}