import { CancellationRequest, CompleteWorkerRequest, WorkerRequest } from "../types/WorkerRequest";
import { WorkerResponse } from "../types/WorkerResponse";
import LatticeWorker from "../workers/latticeWorker?worker";

// Single worker is reused for all formal context calculations
// This way the data can be kept in the worker to save some time due to fewer serialization
// When a new file is loaded, new worker is created and the old one destroyed

export default class LatticeWorkerQueue {
    private worker: Worker | null = null;
    private lastId: number = 0;
    private queue: Array<Job> = [];
    private currentJob: Job | null  = null;

    public enqueue<T extends WorkerResponse>(
        request: WorkerRequest,
        responseCallback: (response: T) => void,
        statusMessageCallback?: (message: string | null) => void,
        progressCallback?: (jobId: number, progress: number) => void,
        startCallback?: (jobId: number) => void,
        cancelCallback?: (jobId: number) => void,
    ): number {
        this.lastId++;
        const jobId = this.lastId;

        const job: Job = {
            id: jobId,
            request,
            responseCallback,
            statusMessageCallback,
            progressCallback,
            startCallback,
            cancelCallback,
        };

        this.queue.push(job);
        this.next();

        return jobId;
    }

    public cancelJob(jobId: number) {
        if (this.currentJob && this.currentJob.id === jobId) {
            const request: CancellationRequest = {
                jobId,
                type: "cancel",
            };
            this.worker?.postMessage(request);

            if (this.currentJob.cancelCallback) {
                this.currentJob.cancelCallback(this.currentJob.id);
            }
            this.currentJob = null;
            this.next();
        }
        else {
            this.queue = this.queue.filter((j) => j.id !== jobId);
        }
    }

    public reset() {
        this.worker?.terminate();

        this.lastId = 0;
        this.currentJob = null;
        this.queue = [];

        this.worker = new LatticeWorker();
        this.worker.addEventListener("message", (e) => this.onResponse(e));
    }

    private next() {
        if (this.queue.length === 0 || this.currentJob) {
            return;
        }

        this.currentJob = this.queue.shift() || null;
        
        if (this.currentJob) {
            const request: CompleteWorkerRequest = {
                jobId: this.currentJob.id,
                time: new Date().getTime(),
                ...this.currentJob.request
            };

            if (!this.worker) {
                throw new Error("Worker is not initialized");
            }

            this.worker.postMessage(request);
            
            if (this.currentJob.startCallback) {
                this.currentJob.startCallback(this.currentJob.id);
            }
        }
    }

    private onResponse(e: MessageEvent<WorkerResponse>) {
        // ignore responses with jobId !== this.currentJob.id
        // or suppose that these responses do not exist?

        if (e.data.jobId !== this.currentJob?.id) {
            return;
        }

        switch (e.data.type) {
            case "status":
                if (this.currentJob?.statusMessageCallback) {
                    this.currentJob?.statusMessageCallback(e.data.message);
                }
                break;
            case "progress":
                if (this.currentJob?.progressCallback) {
                    this.currentJob?.progressCallback(this.currentJob.id, e.data.progress);
                }
                break;
            case "finished":
                this.currentJob = null;
                this.next();
                break;
            default:
                console.log(`[${e.data.type}] receiving response: ${new Date().getTime() - e.data.time} ms`);
                this.currentJob?.responseCallback(e.data);
                break;
        }
    }
}

type Job = {
    readonly id: number,
    readonly request: WorkerRequest,
    readonly responseCallback: (response: any) => void,
    readonly statusMessageCallback?: (message: string | null) => void,
    readonly progressCallback?: (jobId: number, progress: number) => void,
    readonly startCallback?: (jobId: number) => void,
    readonly cancelCallback?: (jobId: number) => void,
}