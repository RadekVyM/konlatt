import { RawFormalConcept } from "./RawFormalConcept";
import { RawFormalContext } from "./RawFormalContext";
import { ConceptLattice } from "./ConceptLattice";

export type WorkerResponse = StatusResponse | ContextParsingResponse | ConceptComputationResponse | LatticeComputationResponse

export type StatusResponse = {
    type: "status",
    message: string
}

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