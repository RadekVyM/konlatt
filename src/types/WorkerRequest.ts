export type WorkerRequest = FileToLatticeRequest

export type FileToLatticeRequest = {
    type: "file-to-lattice",
    content: string,
}