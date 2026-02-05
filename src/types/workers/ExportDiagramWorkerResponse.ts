export type ExportDiagramWorkerResponse = BlobResponse | DrawDoneResponse

export type BlobResponse = {
    type: "blob",
    blob: Blob | null,
}

export type DrawDoneResponse = {
    type: "draw-done",
}