import useDataStructuresStore from "../stores/useDataStructuresStore";
import { CancellationRequest, CompleteMainWorkerRequest, MainWorkerRequest } from "../types/workers/MainWorkerRequest";
import { WorkerDataRequestResponse, MainWorkerResponse } from "../types/workers/MainWorkerResponse";
import MainWorker from "../workers/MainWorker?worker";

// Single worker is reused for all formal context calculations
// This way the data can be kept in the worker to save some time due to fewer serialization
// When a new file is loaded, new worker is created and the old one destroyed

/**
 * Manages a sequential queue of tasks for a single Web Worker.
 * Ensures only one calculation runs at a time .
 */
export default class MainWorkerQueue {
    #worker: Worker | null = null;
    #lastId: number = 0;
    #queue: Array<Job> = [];
    #currentJob: Job | null  = null;

    /**
     * Adds a new task to the queue.
     * @returns The unique ID assigned to this job.
     */
    enqueue<T extends MainWorkerResponse>(
        request: MainWorkerRequest,
        onResponse: (response: T) => void,
        callbacks?: {
            onStatusMessage?: (message: string | null) => void,
            onError?: (jobId: number, message: string | null) => void,
            onProgress?: (jobId: number, progress: number) => void,
            onStart?: (jobId: number) => void,
            onCancel?: (jobId: number) => void,
        },
    ): number {
        this.#lastId++;
        const jobId = this.#lastId;

        const job: Job = {
            id: jobId,
            request,
            responseCallback: onResponse,
            statusMessageCallback: callbacks?.onStatusMessage,
            errorCallback: callbacks?.onError,
            progressCallback: callbacks?.onProgress,
            startCallback: callbacks?.onStart,
            cancelCallback: callbacks?.onCancel,
        };

        this.#queue.push(job);
        // Attempt to run if worker is idle
        this.#next();

        return jobId;
    }

    /**
     * Cancels a specific job. If the job is currently running, 
     * it notifies the worker to stop.
     */
    cancelJob(jobId: number) {
        if (this.#currentJob !== null && this.#currentJob.id === jobId) {
            // Handle cancellation of the active task
            const request: CancellationRequest = {
                jobId,
                type: "cancel",
            };
            this.#worker?.postMessage(request);

            if (this.#currentJob.cancelCallback) {
                this.#currentJob.cancelCallback(this.#currentJob.id);
            }
            if (this.#currentJob.statusMessageCallback) {
                this.#currentJob.statusMessageCallback(null);
            }
            this.#currentJob = null;
            this.#next();
        }
        else {
            // Remove from queue if it hasn't started yet
            this.#queue = this.#queue.filter((j) => j.id !== jobId);
        }
    }

    /**
     * Clears all pending jobs and attempts to stop the active one.
     */
    cancelAllJobs() {
        if (this.#currentJob !== null) {
            const request: CancellationRequest = {
                jobId: this.#currentJob.id,
                type: "cancel",
            };
            this.#worker?.postMessage(request);

            if (this.#currentJob.cancelCallback) {
                this.#currentJob.cancelCallback(this.#currentJob.id);
            }
            if (this.#currentJob.statusMessageCallback) {
                this.#currentJob.statusMessageCallback(null);
            }
            this.#currentJob = null;
        }

        this.#queue = [];
    }

    /**
     * Initializes a new Worker instance and resets the state.
     */
    setup() {
        this.#worker?.terminate();

        this.#lastId = 0;
        this.#currentJob = null;
        this.#queue = [];

        this.#worker = new MainWorker();
        this.#worker.addEventListener("message", (e) => this.#onResponse(e));
    }

    /**
     * Cleans up resources and kills the worker thread.
     */
    dispose() {
        this.#worker?.terminate();
        this.#worker = null;

        this.#lastId = 0;
        this.#currentJob = null;
        this.#queue = [];
    }

    /**
     * Processes the next job in the queue if the worker is free.
     */
    #next() {
        if (this.#queue.length === 0 || this.#currentJob) {
            return;
        }

        this.#currentJob = this.#queue.shift() || null;
        
        if (this.#currentJob) {
            const request: CompleteMainWorkerRequest = {
                jobId: this.#currentJob.id,
                time: new Date().getTime(),
                ...this.#currentJob.request
            };

            if (!this.#worker) {
                throw new Error("Worker is not initialized");
            }

            this.#worker.postMessage(request);
            
            if (this.#currentJob.startCallback) {
                this.#currentJob.startCallback(this.#currentJob.id);
            }
        }
    }

    /**
     * Central message handler for all worker communication.
     */
    #onResponse(e: MessageEvent<MainWorkerResponse>) {
        // ignore responses with jobId !== this.currentJob.id
        // or suppose that these responses do not exist?

        if (e.data.jobId !== this.#currentJob?.id) {
            return;
        }

        switch (e.data.type) {
            case "status":
                this.#currentJob?.statusMessageCallback?.(e.data.message);
                break;
            case "progress":
                this.#currentJob?.progressCallback?.(this.#currentJob.id, e.data.progress);
                break;
            case "finished":
                this.#currentJob = null;
                this.#next();
                break;
            case "data-request":
                const request = hydrateRequestWithData(e.data);
                this.#worker?.postMessage(request);
                break;
            case "error":
                this.#currentJob?.errorCallback?.(this.#currentJob.id, e.data.message);
                this.#currentJob = null;
                this.#next();
                break;
            default:
                console.log(`[${e.data.type}] receiving response: ${new Date().getTime() - e.data.time} ms`);
                this.#currentJob?.responseCallback(e.data);
                break;
        }
    }
}

type Job = {
    readonly id: number,
    readonly request: MainWorkerRequest,
    readonly responseCallback: (response: any) => void,
    readonly statusMessageCallback?: (message: string | null) => void,
    readonly progressCallback?: (jobId: number, progress: number) => void,
    readonly startCallback?: (jobId: number) => void,
    readonly cancelCallback?: (jobId: number) => void,
    readonly errorCallback?: (jobId: number, message: string | null) => void,
}

/**
 * Hydrates a worker request with actual data from the Zustand store
 * based on the specific keys requested by the worker.
 */
function hydrateRequestWithData(response: WorkerDataRequestResponse) {
    const newRequest: CompleteMainWorkerRequest = response.request;

    for (const requestedObject of response.requestedObjects) {
        switch (requestedObject) {
            case "context":
                const context = useDataStructuresStore.getState().context;
                if (!context) {
                    throw new Error("Formal context has not been calculated yet");
                }

                newRequest.context = context;
                break;
            case "concepts":
                const concepts = useDataStructuresStore.getState().concepts;
                if (!concepts) {
                    throw new Error("Formal concepts have not been calculated yet");
                }

                newRequest.concepts = concepts;
                break;
            case "lattice":
                const lattice = useDataStructuresStore.getState().lattice;
                if (!lattice) {
                    throw new Error("Concept lattice has not been calculated yet");
                }

                newRequest.lattice = lattice;
                break;
        }
    }

    return newRequest;
}
