export type LayoutWorkerResponse = LayoutWorkerProgressResponse | LayoutWorkerResultResponse

export type LayoutWorkerProgressResponse = {
    type: "progress",
    progress: number,
}

export type LayoutWorkerResultResponse = {
    type: "result",
    layout: Float32Array,
    computationTime: number,
}