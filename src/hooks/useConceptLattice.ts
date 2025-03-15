import useProjectStore from "./stores/useProjectStore";
import { ConceptComputationRequest, ContextParsingRequest, LatticeComputationRequest, LayoutComputationRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, LatticeComputationResponse, LayoutComputationResponse } from "../types/WorkerResponse";
import { createPoint, Point } from "../types/Point";

export default function useConceptLattice() {
    const setProgressMessage = useProjectStore((state) => state.setProgressMessage);
    const setFile = useProjectStore((state) => state.setFile);
    const setContext = useProjectStore((state) => state.setContext);
    const setConcepts = useProjectStore((state) => state.setConcepts);
    const setLattice = useProjectStore((state) => state.setLattice);
    const setLayout = useProjectStore((state) => state.setLayout);
    const setDiagramOffsets = useProjectStore((state) => state.setDiagramOffsets);
    const setDiagramOffsetMementos = useProjectStore((state) => state.setDiagramOffsetMementos);
    const workerQueue = useProjectStore((state) => state.workerQueue);

    async function setupLattice(file: File) {
        setFile(file);
        setContext(null);
        setConcepts(null);
        setLattice(null);
        setDiagramOffsets(null);
        setDiagramOffsetMementos({ redos: [], undos: [] });

        const fileContent = await file.text();

        workerQueue.reset();

        const contextRequest: ContextParsingRequest = { type: "parse-context", content: fileContent };
        const conceptsRequest: ConceptComputationRequest = { type: "concepts" };
        const latticeRequest: LatticeComputationRequest = { type: "lattice" };
        const layoutRequest: LayoutComputationRequest = { type: "layout" };

        workerQueue.enqueue<ContextParsingResponse>(contextRequest, (response: ContextParsingResponse) => setContext(response.context), setProgressMessage);
        workerQueue.enqueue<ConceptComputationResponse>(conceptsRequest, (response: ConceptComputationResponse) => setConcepts(response.concepts), setProgressMessage);
        workerQueue.enqueue<LatticeComputationResponse>(latticeRequest, (response: LatticeComputationResponse) => setLattice(response.lattice), setProgressMessage);
        workerQueue.enqueue<LayoutComputationResponse>(layoutRequest, (response: LayoutComputationResponse) => {
            setLayout(response.layout);
            setDiagramOffsets(createDefaultDiagramOffsets(response.layout.length));
            setDiagramOffsetMementos({ redos: [], undos: [] });
        }, setProgressMessage);
    }

    return {
        setupLattice,
    };
}

function createDefaultDiagramOffsets(length: number) {
    const offsets = new Array<Point>(length);

    for (let i = 0; i < length; i++) {
        offsets[i] = createPoint(0, 0, 0);
    }

    return offsets;
}