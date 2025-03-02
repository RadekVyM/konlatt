import { ConceptLattice } from "../types/ConceptLattice";
import { CompleteWorkerRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, FinishedResponse, LatticeComputationResponse, LayoutComputationResponse, StatusResponse } from "../types/WorkerResponse";
import { RawFormalContext } from "../types/RawFormalContext";
import { FormalConcepts } from "../types/FormalConcepts";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";

let formalContext: RawFormalContext | null = null;
let formalConcepts: FormalConcepts | null = null;
let conceptLattice: ConceptLattice | null = null;
let layout: ConceptLatticeLayout | null = null;

self.onmessage = async (event: MessageEvent<CompleteWorkerRequest>) => {
    console.log(`[${event.data.type}] sending arguments: ${new Date().getTime() - event.data.time} ms`);

    switch (event.data.type) {
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

            await calculateLattice(event.data.jobId, formalConcepts);
            break;
        case "layout":
            if (!formalConcepts) {
                throw new Error("Formal concepts have not been calculated yet");
            }
            if (!conceptLattice) {
                throw new Error("Concept lattice has not been calculated yet");
            }

            await calculateLayout(event.data.jobId, formalConcepts, conceptLattice);
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
    const { parseBurmeister } = await import("../services/contextParsing");

    formalContext = parseBurmeister(fileContent);
    self.postMessage(createContextParsingResponse(jobId, formalContext));
}

async function calculateConcepts(jobId: number, context: RawFormalContext) {
    postStatusMessage(jobId, "Computing concepts");

    if (formalConcepts) {
        self.postMessage(createConceptComputationResponse(jobId, formalConcepts));
        return;
    }

    const { computeConcepts } = await import("../services/conceptComputation");

    formalConcepts = computeConcepts(context);
    self.postMessage(createConceptComputationResponse(jobId, formalConcepts));
}

async function calculateLattice(jobId: number, concepts: FormalConcepts) {
    postStatusMessage(jobId, "Computing lattice");

    const { conceptsToLattice } = await import("../services/latticeComputation");

    conceptLattice = conceptsToLattice(concepts);
    const latticeMessage: LatticeComputationResponse = {
        jobId,
        time: new Date().getTime(),
        type: "lattice",
        lattice: conceptLattice
    };

    self.postMessage(latticeMessage);
}

async function calculateLayout(jobId: number, concepts: FormalConcepts, lattice: ConceptLattice) {
    postStatusMessage(jobId, "Computing layout");

    const { computeLayeredLayout } = await import("../services/layouts/layeredLayout");

    layout = computeLayeredLayout(concepts, lattice);
    const layoutMessage: LayoutComputationResponse = {
        jobId,
        time: new Date().getTime(),
        type: "layout",
        layout
    };

    self.postMessage(layoutMessage);
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

function postFinished(jobId: number) {
    const finishedResponse: FinishedResponse = {
        jobId,
        time: new Date().getTime(),
        type: "finished",
    };

    self.postMessage(finishedResponse);
}

function createContextParsingResponse(jobId: number, context: RawFormalContext): ContextParsingResponse {
    return {
        jobId,
        time: new Date().getTime(),
        type: "parse-context",
        context
    };
}

function createConceptComputationResponse(jobId: number, concepts: FormalConcepts): ConceptComputationResponse {
    return {
        jobId,
        time: new Date().getTime(),
        type: "concepts",
        concepts
    };
}