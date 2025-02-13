/* eslint-disable react-compiler/react-compiler */

import useConceptLatticeStore from "./stores/useConceptLatticeStore";
import { ConceptComputationRequest, ContextParsingRequest, LatticeComputationRequest, LayoutComputationRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, LatticeComputationResponse, LayoutComputationResponse } from "../types/WorkerResponse";

// Single worker is reused for all formal context calculations
// This way the data can be kept in the worker to save some time due to fewer serialization
// When a new file is loaded, new worker is created and the old one destroyed

export default function useConceptLattice() {
    const setProgressMessage = useConceptLatticeStore((state) => state.setProgressMessage);
    const setFile = useConceptLatticeStore((state) => state.setFile);
    const setContext = useConceptLatticeStore((state) => state.setContext);
    const setConcepts = useConceptLatticeStore((state) => state.setConcepts);
    const setLattice = useConceptLatticeStore((state) => state.setLattice);
    const setLayout = useConceptLatticeStore((state) => state.setLayout);
    const workerQueue = useConceptLatticeStore((state) => state.workerQueue);

    async function setupLattice(file: File) {
        setFile(file);
        setContext(null);
        setConcepts(null);
        setLattice(null);

        const fileContent = await file.text();

        workerQueue.reset();

        const contextRequest: ContextParsingRequest = { type: "parse-context", content: fileContent };
        const conceptsRequest: ConceptComputationRequest = { type: "concepts" };
        const latticeRequest: LatticeComputationRequest = { type: "lattice" };
        const layoutRequest: LayoutComputationRequest = { type: "layout" };

        workerQueue.enqueue<ContextParsingResponse>(contextRequest, (response: ContextParsingResponse) => setContext(response.context), setProgressMessage);
        workerQueue.enqueue<ConceptComputationResponse>(conceptsRequest, (response: ConceptComputationResponse) => setConcepts(response.concepts), setProgressMessage);
        workerQueue.enqueue<LatticeComputationResponse>(latticeRequest, (response: LatticeComputationResponse) => setLattice(response.lattice), setProgressMessage);
        workerQueue.enqueue<LayoutComputationResponse>(layoutRequest, (response: LayoutComputationResponse) => setLayout(response.layout), setProgressMessage);
    }

    return {
        setupLattice,
    };
}