export type LatticeWorkerRequest = CancellationRequest | ContextParsingRequest | ConceptComputationRequest | LatticeComputationRequest | LayoutComputationRequest

export type CompleteWorkerRequest = {
    jobId: number,
    time: number,
} & LatticeWorkerRequest

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
}

export type CancellationRequest = {
    type: "cancel",
    jobId: number,
}