import { ConceptLattice } from "../types/ConceptLattice";
import { WorkerRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, FinishedResponse, LatticeComputationResponse, StatusResponse } from "../types/WorkerResponse";
import { RawFormalConcept } from "../types/RawFormalConcept";
import { RawFormalContext } from "../types/RawFormalContext";

let formalContext: RawFormalContext | null = null;
let formalConcepts: Array<RawFormalConcept> | null = null;
let conceptLattice: ConceptLattice | null = null;

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    switch (event.data.type) {
        case "file-to-lattice":
            await parseFileContent(event.data.content);

            if (!formalContext) {
                throw new Error("Formal context has not been calculated yet");
            }

            await calculateConcepts(formalContext);

            if (!formalConcepts) {
                throw new Error("Formal concepts have not been calculated yet");
            }

            await calculateLattice(formalConcepts);
            break;
    }

    postStatusMessage(null);
    postFinished();
    // self.close();
};


async function parseFileContent(fileContent: string) {
    postStatusMessage("Parsing file");

    // https://www.audjust.com/blog/wasm-and-workers
    const { parseBurmeister } = await import("../services/contextParsing");

    formalContext = parseBurmeister(fileContent);
    const contextMessage: ContextParsingResponse = {
        type: "context",
        context: formalContext
    };

    self.postMessage(contextMessage);
}

async function calculateConcepts(context: RawFormalContext) {
    postStatusMessage("Computing concepts");

    const { computeConcepts } = await import("../services/conceptComputation");
    
    formalConcepts = computeConcepts(context);
    const conceptsMessage: ConceptComputationResponse = {
        type: "concepts",
        concepts: formalConcepts
    };

    self.postMessage(conceptsMessage);
}

async function calculateLattice(concepts: Array<RawFormalConcept>) {
    postStatusMessage("Computing lattice");

    const { conceptsToLattice } = await import("../services/latticeComputation");

    conceptLattice = conceptsToLattice(concepts);
    const latticeMessage: LatticeComputationResponse = {
        type: "lattice",
        lattice: conceptLattice
    };

    self.postMessage(latticeMessage);
}

function postStatusMessage(message: string | null) {
    const statusResponse: StatusResponse = {
        type: "status",
        message
    };

    self.postMessage(statusResponse);
}

function postFinished() {
    const finishedResponse: FinishedResponse = {
        type: "finished",
    };

    self.postMessage(finishedResponse);
}