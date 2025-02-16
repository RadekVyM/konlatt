import { __collect, conceptsToLattice as conceptsToLatticeAs } from "../as"
import { ConceptLattice } from "../types/ConceptLattice";
import { FormalConcepts } from "../types/FormalConcepts";

/**
 * 
 * @param concepts 
 * @returns Array of indexes of children of each concept
 */
export function conceptsToLattice(concepts: FormalConcepts): ConceptLattice {
    // I need to be cautious with the types here
    const lattice = conceptsToLatticeAs(concepts as any);
    __collect();

    const subconceptsMapping = lattice.map((set) => new Set<number>(set));
    const superconceptsMapping = subconceptsToSuperconcetsMapping(subconceptsMapping);

    return {
        subconceptsMapping,
        superconceptsMapping,
    };
}

function subconceptsToSuperconcetsMapping(subconceptsMapping: Array<Set<number>>) {
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

    return superconceptsMapping;
}