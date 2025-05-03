import { ConceptLattice } from "../types/ConceptLattice";
import { CompleteLayoutComputationRequest, CompleteWorkerRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, FinishedResponse, LatticeComputationResponse, LayoutComputationResponse, ProgressResponse, StatusResponse } from "../types/WorkerResponse";
import { FormalContext } from "../types/FormalContext";
import { FormalConcepts, getSupremum } from "../types/FormalConcepts";
import DiagramLayoutWorker from "./diagramLayoutWorker?worker";
import { calculateSublattice, calculateVisibleConceptIndexes } from "../utils/lattice";
import { createConceptPoint } from "../types/ConceptPoint";
import { Point } from "../types/Point";

let formalContext: FormalContext | null = null;
let formalConcepts: FormalConcepts | null = null;
let conceptLattice: ConceptLattice | null = null;

self.onmessage = async (event: MessageEvent<CompleteWorkerRequest>) => {
    console.log(`[${event.data.type}] sending arguments: ${new Date().getTime() - event.data.time} ms`);

    switch (event.data.type) {
        case "cancel":
            // TODO: handle cancellation
            // TODO: I need to terminate the worker, create a new one and reinitialize it if I want to cancel a WASM computation

            postStatusMessage(event.data.jobId, null);
            return;
        case "parse-context":
            await parseFileContent(event.data.jobId, event.data.content);
            break;
        case "concepts":
            if (!formalContext) {
                throw new Error("Formal context has not been calculated yet");
            }

            await calculateConcepts(event.data.jobId, formalContext);
            break;
        case "lattice":
            if (!formalConcepts) {
                throw new Error("Formal concepts have not been calculated yet");
            }
            if (!formalContext) {
                throw new Error("Formal context has not been calculated yet");
            }

            await calculateLattice(event.data.jobId, formalConcepts, formalContext);
            break;
        case "layout":
            if (!formalConcepts) {
                throw new Error("Formal concepts have not been calculated yet");
            }
            if (!conceptLattice) {
                throw new Error("Concept lattice has not been calculated yet");
            }

            await calculateLayout(
                event.data.jobId,
                formalConcepts,
                conceptLattice,
                event.data.upperConeOnlyConceptIndex,
                event.data.lowerConeOnlyConceptIndex);
            break;
    }

    postStatusMessage(event.data.jobId, null);
    postFinished(event.data.jobId);
    // self.close();
};


async function parseFileContent(jobId: number, fileContent: string) {
    postStatusMessage(jobId, "Parsing file");

    if (formalContext) {
        self.postMessage(createContextParsingResponse(jobId, formalContext));
        return;
    }

    // https://www.audjust.com/blog/wasm-and-workers
    const { parseFileContent } = await import("../services/contextParsing");

    formalContext = await parseFileContent(fileContent);
    self.postMessage(createContextParsingResponse(jobId, formalContext));
}

async function calculateConcepts(jobId: number, context: FormalContext) {
    postStatusMessage(jobId, "Computing concepts");

    if (formalConcepts) {
        self.postMessage(createConceptComputationResponse(jobId, formalConcepts));
        return;
    }

    const { computeConcepts } = await import("../services/conceptComputation");

    const { concepts, computationTime } = await computeConcepts(context, (progress) => postProgressMessage(jobId, progress));
    formalConcepts = concepts;
    self.postMessage(createConceptComputationResponse(jobId, formalConcepts, computationTime));
}

async function calculateLattice(jobId: number, concepts: FormalConcepts, context: FormalContext) {
    postStatusMessage(jobId, "Computing lattice");

    const { conceptsToLattice } = await import("../services/latticeComputation");

    const { lattice, computationTime } = await conceptsToLattice(concepts, context, (progress) => postProgressMessage(jobId, progress));
    conceptLattice = lattice;
    const latticeMessage: LatticeComputationResponse = {
        jobId,
        time: new Date().getTime(),
        type: "lattice",
        lattice: conceptLattice,
        computationTime,
    };

    self.postMessage(latticeMessage);
}

async function calculateLayout(
    jobId: number,
    concepts: FormalConcepts,
    lattice: ConceptLattice,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
) {
    postStatusMessage(jobId, "Computing layout");

    const worker = new DiagramLayoutWorker();
    const { request, reverseIndexMapping } = createCompleteLayoutComputationRequest(concepts, lattice, upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex);

    worker.postMessage(request, [request.subconceptsMappingArrayBuffer.buffer]);

    await new Promise((resolve) => {
        worker.onmessage = (data) => {
            const layoutMessage: LayoutComputationResponse = {
                jobId,
                time: new Date().getTime(),
                type: "layout",
                layout: getValidLayout(data.data.layout, reverseIndexMapping),
                computationTime: data.data.computationTime,
            };
            self.postMessage(layoutMessage);

            resolve(undefined);
        };
    });
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

function createCompleteLayoutComputationRequest(
    concepts: FormalConcepts,
    lattice: ConceptLattice,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
): {
    request: CompleteLayoutComputationRequest,
    reverseIndexMapping: Map<number, number> | null,
} {
    const visibleConceptIndexes = calculateVisibleConceptIndexes(upperConeOnlyConceptIndex, lowerConeOnlyConceptIndex, lattice);

    if (visibleConceptIndexes === null) {
        // TODO: use iterators when available: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/flatMap
        return {
            request: {
                type: "layout",
                conceptsCount: concepts.length,
                supremum: getSupremum(concepts).index,
                subconceptsMappingArrayBuffer: new Int32Array(lattice.subconceptsMapping.flatMap((set) => [set.size, ...set])),
            },
            reverseIndexMapping: null,
        };
    }

    const { reverseIndexMapping, subconceptsMapping, supremum } = calculateSublattice(visibleConceptIndexes, lattice, getSupremum(concepts).index);

    return {
        request: {
            type: "layout",
            conceptsCount: subconceptsMapping.length,
            supremum,
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