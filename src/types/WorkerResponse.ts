import { RawFormalConcept } from "./RawFormalConcept";
import { RawFormalContext } from "./RawFormalContext";
import { ConceptLattice } from "./ConceptLattice";

export type WorkerResponse = FinishedResponse | StatusResponse | ContextParsingResponse | ConceptComputationResponse | LatticeComputationResponse

export type FinishedResponse = {
    type: "finished",
}

export type StatusResponse = {
    type: "status",
    message: string | null
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