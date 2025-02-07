import { RawFormalConcept } from "./RawFormalConcept";
import { RawFormalContext } from "./RawFormalContext";
import { ConceptLattice } from "./ConceptLattice";

export type WorkerResponse = FinishedResponse | StatusResponse | ContextParsingResponse | ConceptComputationResponse | LatticeComputationResponse

export type FinishedResponse = {
    type: "finished",
} & BaseResponse

export type StatusResponse = {
    type: "status",
    message: string | null
} & BaseResponse

export type ContextParsingResponse = {
    type: "parse-context",
    context: RawFormalContext
} & BaseResponse

export type ConceptComputationResponse = {
    type: "concepts",
    concepts: Array<RawFormalConcept>
} & BaseResponse

export type LatticeComputationResponse = {
    type: "lattice",
    lattice: ConceptLattice
} & BaseResponse

type BaseResponse = {
    jobId: number,
}