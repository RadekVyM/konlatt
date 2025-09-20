import { ConceptLattice } from "../types/ConceptLattice";
import { CompleteLayoutComputationRequest, CompleteWorkerRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, ErrorResponse, FinishedResponse, LatticeComputationResponse, LayoutComputationResponse, ProgressResponse, StatusResponse, WorkerDataRequestObject, WorkerDataRequestResponse } from "../types/WorkerResponse";
import { FormalContext } from "../types/FormalContext";
import { FormalConcepts, getInfimum, getSupremum } from "../types/FormalConcepts";
import DiagramLayoutWorker from "./diagramLayoutWorker?worker";
import { createConceptPoint } from "../types/ConceptPoint";
import { Point } from "../types/Point";
import { LayoutWorkerResponse } from "../types/LayoutWorkerResponse";
import { LayoutComputationOptions } from "../types/LayoutComputationOptions";
import { ImportFormat } from "../types/ImportFormat";
import { CsvSeparator } from "../types/CsvSeparator";
import { calculateConeConceptIndexes, calculateSublattice } from "../services/lattice";

let formalContext: FormalContext | null = null;
let formalConcepts: FormalConcepts | null = null;
let conceptLattice: ConceptLattice | null = null;
const workerInstances = new Map<number, { worker: Worker, reject?: (reason?: any) => void }>();

self.onmessage = async (event: MessageEvent<CompleteWorkerRequest>) => {
    console.log(`[${event.data.type}] sending arguments: ${new Date().getTime() - event.data.time} ms`);

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

    postStatusMessage(event.data.jobId, null);
    postFinished(event.data.jobId);
    // self.close();
};


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
    const { request, reverseIndexMapping } = createCompleteLayoutComputationRequest(concepts, lattice, upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex, options);

    worker.postMessage(request, [request.subconceptsMappingArrayBuffer.buffer]);

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
                        layout: getValidLayout(response.layout, reverseIndexMapping),
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
            reject(event.error);
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
    const visibleConceptIndexes = calculateConeConceptIndexes(upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex, lattice);

    if (visibleConceptIndexes === null) {
        // TODO: use iterators when available: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap
        return {
            request: {
                type: "layout",
                options,
                conceptsCount: concepts.length,
                supremum: getSupremum(concepts).index,
                infimum: getInfimum(concepts).index,
                subconceptsMappingArrayBuffer: new Int32Array(lattice.subconceptsMapping.flatMap((set) => [set.size, ...set])),
            },
            reverseIndexMapping: null,
        };
    }

    const { reverseIndexMapping, subconceptsMapping, supremum, infimum } = calculateSublattice(visibleConceptIndexes, lattice, getSupremum(concepts).index);

    return {
        request: {
            type: "layout",
            options,
            conceptsCount: subconceptsMapping.length,
            supremum,
            infimum,
            subconceptsMappingArrayBuffer: new Int32Array(subconceptsMapping.flatMap((set) => [set.size, ...set])),
        },
        reverseIndexMapping,
    };
}

function getValidLayout(layout: Array<Point>, reverseIndexMapping: Map<number, number> | null) {
    if (reverseIndexMapping === null) {
        return layout.map((point, index) => createConceptPoint(point[0], point[1], point[2], index));
    }

    return layout.map((point, index) => createConceptPoint(point[0], point[1], point[2], reverseIndexMapping.get(index)!));
}

function tryRequestDataFromMainThread(request: CompleteWorkerRequest, requestedObjects: Array<WorkerDataRequestObject>) {
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

function tryGetIncomingData(event: MessageEvent<CompleteWorkerRequest>) {
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

async function tryThrow<T>(promise: Promise<T>, message: string) {
    try {
        return await promise;
    }
    catch (e) {
        console.error(e);
        throw new Error(message);
    }
}