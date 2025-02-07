export type WorkerRequest = ContextParsingRequest | ConceptComputationRequest | LatticeComputationRequest

export type CompleteWorkerRequest = {
    jobId: number,
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