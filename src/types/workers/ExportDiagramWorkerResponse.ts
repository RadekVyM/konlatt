export type ExportDiagramWorkerResponse = BlobResponse | DrawDoneResponse | DrawingResponse

export type BlobResponse = {
    type: "blob",
    blob: Blob | null,
}

export type DrawDoneResponse = {
    type: "draw-done",
}

export type DrawingResponse = {
    type: "drawing",
}