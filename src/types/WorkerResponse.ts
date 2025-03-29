import { FormalContext } from "./FormalContext";
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
    context: FormalContext
} & BaseResponse

export type ConceptComputationResponse = {
    type: "concepts",
    concepts: FormalConcepts,
    computationTime?: number,
} & BaseResponse

export type LatticeComputationResponse = {
    type: "lattice",
    lattice: ConceptLattice,
    computationTime?: number,
} & BaseResponse

export type LayoutComputationResponse = {
    type: "layout",
    layout: ConceptLatticeLayout,
    computationTime?: number,
} & BaseResponse

type BaseResponse = {
    jobId: number,
    time: number,
}