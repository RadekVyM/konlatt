import { RawFormalContext } from "./RawFormalContext";
import { ConceptLattice } from "./ConceptLattice";
import { FormalConcepts } from "./FormalConcepts";
import { ConceptLatticeLayout } from "./ConceptLatticeLayout";

export type WorkerResponse = FinishedResponse | StatusResponse | ProgressResponse | ContextParsingResponse | ConceptComputationResponse | LatticeComputationResponse | LayoutComputationResponse

export type FinishedResponse = {
    type: "finished",
} & BaseResponse

export type StatusResponse = {
    type: "status",
    message: string | null
} & BaseResponse

export type ProgressResponse = {
    type: "progress",
    progress: number
} & BaseResponse

export type ContextParsingResponse = {
    type: "parse-context",
    context: RawFormalContext
} & BaseResponse

export type ConceptComputationResponse = {
    type: "concepts",
    concepts: FormalConcepts
} & BaseResponse

export type LatticeComputationResponse = {
    type: "lattice",
    lattice: ConceptLattice
} & BaseResponse

export type LayoutComputationResponse = {
    type: "layout",
    layout: ConceptLatticeLayout
} & BaseResponse

type BaseResponse = {
    jobId: number,
    time: number,
}