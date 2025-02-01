import { LatticeComputationRequest } from "../types/LatticeComputationRequest";
import { LatticeComputationResponse } from "../types/LatticeComputationResponse";

self.onmessage = async (event: MessageEvent<LatticeComputationRequest>) => {
    // https://www.audjust.com/blog/wasm-and-workers
    const { conceptsToLattice } = await import("../services/latticeComputation");

    const lattice = conceptsToLattice(event.data.concepts);
    const message: LatticeComputationResponse = {
        lattice
    };

    self.postMessage(message);

    self.close();
};