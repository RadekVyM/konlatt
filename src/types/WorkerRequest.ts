export type WorkerRequest = CancellationRequest | ContextParsingRequest | ConceptComputationRequest | LatticeComputationRequest | LayoutComputationRequest

export type CompleteWorkerRequest = {
    jobId: number,
    time: number,
} & WorkerRequest

export type ContextParsingRequest = {
    type: "parse-context",
    content: string,
}

export type ConceptComputationRequest = {
    type: "concepts",
}

export type LatticeComputationRequest = {
    type: "lattice",
}

export type LayoutComputationRequest = {
    type: "layout",
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
}

export type CancellationRequest = {
    type: "cancel",
    jobId: number,
}

export type CompleteLayoutComputationRequest = {
    supremum: number,
    conceptsCount: number,
    subconceptsMappingArrayBuffer: Int32Array,    
} & LayoutComputationRequest
