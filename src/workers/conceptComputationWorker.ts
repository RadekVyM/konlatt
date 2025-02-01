import { ConceptComputationRequest } from "../types/ConceptComputationRequest";
import { ConceptComputationResponse } from "../types/ConceptComputationResponse";

self.onmessage = async (event: MessageEvent<ConceptComputationRequest>) => {
    // https://www.audjust.com/blog/wasm-and-workers
    const { computeConcepts } = await import("../services/conceptComputation");

    const concepts = computeConcepts(event.data.context);
    const message: ConceptComputationResponse = {
        concepts
    };

    self.postMessage(message);

    self.close();
};