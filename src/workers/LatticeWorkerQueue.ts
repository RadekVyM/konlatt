import { CompleteWorkerRequest, WorkerRequest } from "../types/WorkerRequest";
import { WorkerResponse } from "../types/WorkerResponse";
import LatticeWorker from "../workers/latticeWorker?worker";

export default class LatticeWorkerQueue {
    private worker: Worker | null = null;
    private lastId: number = 0;
    private queue: Array<Job> = [];
    private currentJob: Job | null  = null;

    public enqueue<T extends WorkerResponse>(
        request: WorkerRequest,
        responseCallback: (response: T) => void,
        statusMessageCallback?: (message: string | null) => void,
    ): number {
        this.lastId++;
        const jobId = this.lastId;

        const job: Job = {
            id: jobId,
            request,
            responseCallback,
            statusMessageCallback
        };

        this.queue.push(job);
        this.next();

        return jobId;
    }

    public cancelJob(jobId: number) {
        if (this.currentJob && this.currentJob.id === jobId) {
            // TODO: I need to terminate the worker, create a new one and reinitialize it if I want to cancel a WASM computation

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
                ...this.currentJob.request
            };

            if (!this.worker) {
                throw new Error("Worker is not initialized");
            }

            this.worker.postMessage(request);
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
            case "finished":
                this.currentJob = null;
                this.next();
                break;
            default:
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
}