import { ConceptLattice } from "./ConceptLattice";
import { FormalConcepts } from "./FormalConcepts";
import { FormalContext } from "./FormalContext";

export type WorkerRequest = CancellationRequest | ContextParsingRequest | ConceptComputationRequest | LatticeComputationRequest | LayoutComputationRequest

export type CompleteWorkerRequest = {
    jobId: number,
    time: number,
} & WorkerRequest

export type ContextParsingRequest = {
    type: "parse-context",
    content: string,
} & BaseRequest

export type ConceptComputationRequest = {
    type: "concepts",
} & BaseRequest

export type LatticeComputationRequest = {
    type: "lattice",
} & BaseRequest

export type LayoutComputationRequest = {
    type: "layout",
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
} & BaseRequest

export type CancellationRequest = {
    type: "cancel",
    jobId: number,
} & BaseRequest

export type CompleteLayoutComputationRequest = {
    type: "layout",
    supremum: number,
    conceptsCount: number,
    subconceptsMappingArrayBuffer: Int32Array,    
} & BaseRequest

type BaseRequest = {
    context?: FormalContext
    concepts?: FormalConcepts,
    lattice?: ConceptLattice,
}