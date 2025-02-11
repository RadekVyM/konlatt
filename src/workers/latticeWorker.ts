import { ConceptLattice } from "../types/ConceptLattice";
import { CompleteWorkerRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, FinishedResponse, LatticeComputationResponse, StatusResponse } from "../types/WorkerResponse";
import { RawFormalContext } from "../types/RawFormalContext";
import { FormalConcepts } from "../types/FormalConcepts";

let formalContext: RawFormalContext | null = null;
let formalConcepts: FormalConcepts | null = null;
let conceptLattice: ConceptLattice | null = null;

self.onmessage = async (event: MessageEvent<CompleteWorkerRequest>) => {
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
    }

    postStatusMessage(event.data.jobId, null);
    postFinished(event.data.jobId);
    // self.close();
};


async function parseFileContent(jobId: number, fileContent: string) {
    postStatusMessage(jobId, "Parsing file");

    // https://www.audjust.com/blog/wasm-and-workers
    const { parseBurmeister } = await import("../services/contextParsing");

    formalContext = parseBurmeister(fileContent);
    const contextMessage: ContextParsingResponse = {
        jobId,
        type: "parse-context",
        context: formalContext
    };

    self.postMessage(contextMessage);
}

async function calculateConcepts(jobId: number, context: RawFormalContext) {
    postStatusMessage(jobId, "Computing concepts");

    const { computeConcepts } = await import("../services/conceptComputation");
    
    formalConcepts = computeConcepts(context);
    const conceptsMessage: ConceptComputationResponse = {
        jobId,
        type: "concepts",
        concepts: formalConcepts
    };

    self.postMessage(conceptsMessage);
}

async function calculateLattice(jobId: number, concepts: FormalConcepts) {
    postStatusMessage(jobId, "Computing lattice");

    const { conceptsToLattice } = await import("../services/latticeComputation");

    conceptLattice = conceptsToLattice(concepts);
    const latticeMessage: LatticeComputationResponse = {
        jobId,
        type: "lattice",
        lattice: conceptLattice
    };

    self.postMessage(latticeMessage);
}

function postStatusMessage(jobId: number, message: string | null) {
    const statusResponse: StatusResponse = {
        jobId,
        type: "status",
        message
    };

    self.postMessage(statusResponse);
}

function postFinished(jobId: number) {
    const finishedResponse: FinishedResponse = {
        jobId,
        type: "finished",
    };

    self.postMessage(finishedResponse);
}