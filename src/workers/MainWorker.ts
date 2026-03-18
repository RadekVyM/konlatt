import { ConceptLattice } from "../types/ConceptLattice";
import { CompleteLayoutComputationRequest, CompleteMainWorkerRequest } from "../types/workers/MainWorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, ErrorResponse, FinishedResponse, LatticeComputationResponse, LayoutComputationResponse, ProgressResponse, StatusResponse, WorkerDataRequestObject, WorkerDataRequestResponse } from "../types/workers/MainWorkerResponse";
import { FormalContext } from "../types/FormalContext";
import { FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import DiagramLayoutWorker from "./DiagramLayoutWorker?worker";
import { ConceptPoint, createConceptPoint } from "../types/diagram/ConceptPoint";
import { ImportFormat } from "../types/ImportFormat";
import { CsvSeparator } from "../types/CsvSeparator";
import { calculateConeConceptIndexes, calculateSublattice } from "../services/lattice";
import { LayoutComputationOptions } from "../types/diagram/LayoutComputationOptions";
import { LayoutWorkerResponse } from "../types/diagram/LayoutWorkerResponse";
import { ConceptLatticeLayout } from "../types/diagram/ConceptLatticeLayout";

// Main worker of the app that handles all parallel (asynchronous) calculations

// Persistent worker state 
// These variables persist across multiple postMessage calls until the worker is terminated
let formalContext: FormalContext | null = null;
let formalConcepts: FormalConcepts | null = null;
let conceptLattice: ConceptLattice | null = null;

/**
 * Tracks active sub-worker instances (DiagramLayoutWorker) by jobId 
 * to allow for cancellation/termination.
 */
const workerInstances = new Map<number, { worker: Worker, reject?: (reason?: any) => void }>();

self.onmessage = async (event: MessageEvent<CompleteMainWorkerRequest>) => {
    console.log(`[${event.data.type}] sending arguments: ${new Date().getTime() - event.data.time} ms`);

    // Update local state if the main thread provided missing data in the request
    tryGetIncomingData(event);

    try {
        switch (event.data.type) {
            case "cancel":
                const workerInstance = workerInstances.get(event.data.jobId);

                if (workerInstance) {
                    workerInstance.worker.terminate();
                    workerInstances.delete(event.data.jobId);
                    workerInstance.reject?.();
                }
                return;
            case "parse-context":
                await parseFileContent(event.data.jobId, event.data.content, event.data.format, event.data.csvSeparator);
                break;
            case "concepts":
                if (!formalContext) {
                    tryRequestDataFromMainThread(event.data, ["context"]);
                    return;
                }

                await calculateConcepts(event.data.jobId, formalContext);
                break;
            case "lattice":
                if (!formalConcepts || !formalContext) {
                    tryRequestDataFromMainThread(event.data, ["concepts", "context"]);
                    return;
                }

                await calculateLattice(event.data.jobId, formalConcepts, formalContext);
                break;
            case "layout":
                if (!formalConcepts || !conceptLattice) {
                    tryRequestDataFromMainThread(event.data, ["concepts", "lattice"]);
                    return;
                }

                await calculateLayout(
                    event.data.jobId,
                    formalConcepts,
                    conceptLattice,
                    event.data.upperConeOnlyConceptIndex,
                    event.data.lowerConeOnlyConceptIndex,
                    event.data.options);
                break;
        }
    }
    catch (error) {
        if (!error) {
            return;
        }

        console.warn(error);
        postError(event.data.jobId, error);

        return;
    }

    // Notify UI that the specific job sequence is complete
    postStatusMessage(event.data.jobId, null);
    postFinished(event.data.jobId);
};


/**
 * Parses raw file string into a FormalContext.
 * If data is already parsed, it returns the cached version.
 */
async function parseFileContent(jobId: number, fileContent: string, format: ImportFormat, separator?: CsvSeparator) {
    postStatusMessage(jobId, "Parsing file");

    if (formalContext) {
        self.postMessage(createContextParsingResponse(jobId, formalContext));
        return;
    }

    // https://www.audjust.com/blog/wasm-and-workers
    const { parseFileContent } = await tryThrow(import("../services/parsing"), "Scripts could not be loaded.");

    const { context, concepts, lattice } = await parseFileContent(fileContent, format, separator);

    formalContext = context;
    formalConcepts = concepts || null;
    conceptLattice = lattice || null;

    self.postMessage(createContextParsingResponse(jobId, formalContext));
}

/**
 * Computes all formal concepts from the context.
 */
async function calculateConcepts(jobId: number, context: FormalContext) {
    postStatusMessage(jobId, "Computing concepts");

    if (formalConcepts) {
        self.postMessage(createConceptComputationResponse(jobId, formalConcepts));
        return;
    }

    const { computeConcepts } = await tryThrow(import("../services/concepts"), "Scripts could not be loaded.");

    const { concepts, computationTime } = await tryThrow(
        computeConcepts(context, (progress) => postProgressMessage(jobId, progress)),
        "Concept computation failed");
    formalConcepts = concepts;
    self.postMessage(createConceptComputationResponse(jobId, formalConcepts, computationTime));
}

/**
 * Computes the concept lattice.
 */
async function calculateLattice(jobId: number, concepts: FormalConcepts, context: FormalContext) {
    postStatusMessage(jobId, "Computing lattice");

    if (conceptLattice) {
        self.postMessage(createLatticeComputationResponse(jobId, conceptLattice));
        return;
    }

    const { conceptsToLattice } = await tryThrow(import("../services/lattice"), "Scripts could not be loaded.");

    const { lattice, computationTime } = await tryThrow(
        conceptsToLattice(concepts, context, (progress) => postProgressMessage(jobId, progress)),
        "Lattice computation failed");
    conceptLattice = lattice;
    self.postMessage(createLatticeComputationResponse(jobId, conceptLattice, computationTime));
}

/**
 * Offloads visual layout computation to a dedicated sub-worker.
 * Uses `Transferable` objects (`ArrayBuffer`) for high performance.
 */
async function calculateLayout(
    jobId: number,
    concepts: FormalConcepts,
    lattice: ConceptLattice,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    options: LayoutComputationOptions,
) {
    postStatusMessage(jobId, "Computing layout");

    const worker = new DiagramLayoutWorker();
    const { request, reverseIndexMapping } = createCompleteLayoutComputationRequest(
        concepts,
        lattice,
        upperConeOnlyConceptIndex,
        lowerConeOnlyConceptIndex,
        options);

    // Transfer the underlying buffer to the sub-worker to avoid cloning overhead
    worker.postMessage(request, [request.subconceptsRelationArrayBuffer.buffer]);

    await tryThrow(new Promise((resolve, reject) => {
        workerInstances.set(jobId, { worker, reject });

        worker.onmessage = (event) => {
            const response = event.data as LayoutWorkerResponse;

            switch (response.type) {
                case "progress":
                    postProgressMessage(jobId, response.progress);

                    break;
                case "result":
                    const layoutMessage: LayoutComputationResponse = {
                        jobId,
                        time: new Date().getTime(),
                        type: "layout",
                        layout: convertToConceptLatticeLayout(response.layout, request.conceptsCount, reverseIndexMapping),
                        computationTime: response.computationTime,
                    };
                    self.postMessage(layoutMessage);

                    workerInstances.delete(jobId);
                    resolve(undefined);
                    break;
            }
        };
        worker.onerror = (event) => {
            workerInstances.delete(jobId);
            reject(event.message);
        };
    }), "Diagram layout computation failed");
}

function postStatusMessage(jobId: number, message: string | null) {
    const statusResponse: StatusResponse = {
        jobId,
        time: new Date().getTime(),
        type: "status",
        message
    };

    self.postMessage(statusResponse);
}

function postProgressMessage(jobId: number, progress: number) {
    const progressResponse: ProgressResponse = {
        jobId,
        time: new Date().getTime(),
        type: "progress",
        progress
    };

    self.postMessage(progressResponse);
}

function postFinished(jobId: number) {
    const finishedResponse: FinishedResponse = {
        jobId,
        time: new Date().getTime(),
        type: "finished",
    };

    self.postMessage(finishedResponse);
}

function postError(jobId: number, error?: any) {
    const errorResponse: ErrorResponse = {
        jobId,
        time: new Date().getTime(),
        type: "error",
        message: error?.message || null,
    };

    self.postMessage(errorResponse);
}

function createContextParsingResponse(jobId: number, context: FormalContext): ContextParsingResponse {
    return {
        jobId,
        time: new Date().getTime(),
        type: "parse-context",
        context
    };
}

function createConceptComputationResponse(jobId: number, concepts: FormalConcepts, computationTime?: number): ConceptComputationResponse {
    return {
        jobId,
        time: new Date().getTime(),
        type: "concepts",
        concepts,
        computationTime,
    };
}

function createLatticeComputationResponse(jobId: number, lattice: ConceptLattice, computationTime?: number): LatticeComputationResponse {
    return {
        jobId,
        time: new Date().getTime(),
        type: "lattice",
        lattice,
        computationTime,
    };
}

/**
 * Prepares the request for the `DiagramLayoutWorker`. 
 * Handles sub-lattice filtering and flattens relations into an `Int32Array`.
 */
function createCompleteLayoutComputationRequest(
    concepts: FormalConcepts,
    lattice: ConceptLattice,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    options: LayoutComputationOptions,
): {
    request: CompleteLayoutComputationRequest,
    reverseIndexMapping: Map<number, number> | null,
} {
    const sublatticeConceptIndexes = calculateConeConceptIndexes(upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex, lattice);

    if (sublatticeConceptIndexes === null) {
        // TODO: use iterators when available:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap
        return {
            request: {
                type: "layout",
                options,
                conceptsCount: concepts.length,
                supremum: getSupremum(concepts).index,
                infimum: getInfimum(concepts).index,
                // Flattening Set<number>[] into [size, ...elements] for efficient binary transfer
                subconceptsRelationArrayBuffer: new Int32Array(lattice.subconceptsRelation.flatMap((set) => [set.size, ...set])),
            },
            reverseIndexMapping: null,
        };
    }

    const {
        reverseIndexMapping,
        subconceptsRelation,
        supremum,
        infimum,
    } = calculateSublattice(sublatticeConceptIndexes, lattice, getSupremum(concepts).index);

    return {
        request: {
            type: "layout",
            options,
            conceptsCount: subconceptsRelation.length,
            supremum,
            infimum,
            // Flattening Set<number>[] into [size, ...elements] for efficient binary transfer
            subconceptsRelationArrayBuffer: new Int32Array(subconceptsRelation.flatMap((set) => [set.size, ...set])),
        },
        reverseIndexMapping,
    };
}

/**
 * Maps flat `Float32Array` coordinates back to `ConceptPoint` objects.
 */
function convertToConceptLatticeLayout(
    layout: Float32Array,
    conceptsCount: number,
    reverseIndexMapping: ReadonlyMap<number, number> | null,
): ConceptLatticeLayout {
    const validLayout = new Array<ConceptPoint>();

    for (let i = 0; i < conceptsCount; i++) {
        const start = i * 3;
        const x = layout[start];
        const y = layout[start + 1];
        const z = layout[start + 2];
        const index = reverseIndexMapping === null ? i : reverseIndexMapping.get(i)!;

        validLayout.push(createConceptPoint(x, y, z, index));
    }

    return validLayout;
}

function tryRequestDataFromMainThread(request: CompleteMainWorkerRequest, requestedObjects: ReadonlyArray<WorkerDataRequestObject>) {
    // This is needed mainly because of Safari... 🤦‍♂️
    // Safari is too efficient (or grasping) and clears data from web workers
    // when it thinks that the workers do not deserve to have the data.
    // This is probably it: https://stackoverflow.com/a/38976243

    // When this happens, I simply request the data from the main thread
    // where the data should be stored in a store, otherwise something really bad has happened.
    // The main thread then resends the previous request (the request that triggered the data request)
    // with the requested data.

    console.log("requesting data...");

    const response: WorkerDataRequestResponse = {
        type: "data-request",
        jobId: request.jobId,
        time: 0,
        request,
        requestedObjects,
    };

    self.postMessage(response);
}

/**
 * Populates worker state from a request if the main thread provided them.
 */
function tryGetIncomingData(event: MessageEvent<CompleteMainWorkerRequest>) {
    if (event.data.context) {
        formalContext = event.data.context;
    }
    if (event.data.concepts) {
        formalConcepts = event.data.concepts;
    }
    if (event.data.lattice) {
        conceptLattice = event.data.lattice;
    }
}

/**
 * Simple async wrapper for consistent error handling and user-friendly error messages.
 */
async function tryThrow<T>(promise: Promise<T>, message: string) {
    try {
        return await promise;
    }
    catch (e) {
        console.error(e);
        throw new Error(message);
    }
}