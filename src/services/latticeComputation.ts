import { RawFormalConcept } from "../types/RawFormalConcept";
import { __collect, conceptsToLattice as conceptsToLatticeAs } from "../as"
import { ConceptLattice } from "../types/ConceptLattice";

/**
 * 
 * @param concepts 
 * @returns Array of indexes of children of each concept
 */
export function conceptsToLattice(concepts: Array<RawFormalConcept>): ConceptLattice {
    const lattice = conceptsToLatticeAs(concepts);
    __collect();

    return {
        mapping: lattice.map((set) => new Set<number>(set)),
    };
}