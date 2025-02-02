import { FileToLatticeRequest } from "../types/FileToLatticeRequest";
import { ConceptComputationResponse, ContextParsingResponse, LatticeComputationResponse } from "../types/FileToLatticeResponse";

self.onmessage = async (event: MessageEvent<FileToLatticeRequest>) => {
    // https://www.audjust.com/blog/wasm-and-workers
    const { parseBurmeister } = await import("../services/contextParsing");

    const context = parseBurmeister(event.data.content);
    const contextMessage: ContextParsingResponse = {
        type: "context",
        context
    };

    self.postMessage(contextMessage);

    const { computeConcepts } = await import("../services/conceptComputation");
    
    const concepts = computeConcepts(context);
    const conceptsMessage: ConceptComputationResponse = {
        type: "concepts",
        concepts
    };

    self.postMessage(conceptsMessage);

    const { conceptsToLattice } = await import("../services/latticeComputation");

    const lattice = conceptsToLattice(concepts);
    const latticeMessage: LatticeComputationResponse = {
        type: "lattice",
        lattice
    };

    self.postMessage(latticeMessage);

    self.close();
};