// Based on code used here: https://upriss.github.io/educaJS/binaryRelations/binRel.html?ttype=lattice&rtype=fca&graph=%7B%5Bgreen%2Cblue%5D%2C%20%5Borange%2Cred%5D%2C%20%5Bgreen%2Cblue%5D%2C%20%5Borange%2Cyellow%5D%2C%20%5Bviolet%2Cblue%5D%2C%20%5Bviolet%2Cred%5D%2C%20%5Bgreen%2Cyellow%5D%7D%20%0A

import { FormalConcept } from "../types/FormalConcept";
import { isSortedSubsetOf } from "../utils/arrays";

export function conceptsToLattice(concepts: Array<FormalConcept>): Array<Array<i32>> {
    // It is still not usable for lots of concepts – works quite fine with 3000 concepts
    const startTime = Date.now();

    // lattice[i] = a set of direct subconcepts of a concept concepts[i]
    const lattice: Array<Set<i32>> = new Array<Set<i32>>(concepts.length);
    for (let i = 0; i < concepts.length; i++) {
        lattice[i] = new Set<i32>();
    }

    // sort concepts by intent's length from biggest to smallest
    // TODO: indexy v tom výsledném svazu platí pro tohle setřízené pole!!!
    // => třízení bych měl dělat mimo tuhle funkci
    concepts.sort((first, second) => second.attributes.length - first.attributes.length);

    for (let i = 0; i < concepts.length; i++) {
        // (direct) subconcepts of a concept concepts[i]
        const subConcepts: Array<i32> = new Array<i32>();

        for (let j = i - 1; j >= 0; j--) {
            // j is subconcept of i
            if (isSortedSubsetOf(concepts[i].attributes, concepts[j].attributes)) {
                subConcepts.push(j);
                //lattice.add(`${i}>${j}`);
                lattice[i].add(j);

                // if one of the subconcepts has j as a subconcept, j is not a subconcept of i
                for (let k = 0; k < subConcepts.length; k++) { // delete transitive links
                    const superConcept = subConcepts[k];
                    //if (lattice.has(`${superConcepts[k]}>${j}`)) {
                    if (lattice[superConcept].has(j)) {
                        lattice[i].delete(j);
                        //lattice.delete(`${i}>${j}`);
                        break;
                    }
                }
            }
        }
    }

    console.log(`lattice: ${Date.now() - startTime} ms`);

    return lattice.map<Array<i32>>((set) => set.values());
}