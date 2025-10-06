export type StatusItem = {
    jobId: number,
    title: string,
    isDone: boolean,
    isError: boolean,
    showProgress: boolean,
    progress: number,
    startTime: number,
    endTime: number,
    time?: number,
    tag?: string,
}