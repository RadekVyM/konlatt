import { RawFormalConcept } from "./RawFormalConcept";
import { RawFormalContext } from "./RawFormalContext";
import { ConceptLattice } from "./ConceptLattice";

export type FileToLatticeResponse = ContextParsingResponse | ConceptComputationResponse | LatticeComputationResponse

export type ContextParsingResponse = {
    type: "context",
    context: RawFormalContext
}

export type ConceptComputationResponse = {
    type: "concepts",
    concepts: Array<RawFormalConcept>
}

export type LatticeComputationResponse = {
    type: "lattice",
    lattice: ConceptLattice
}