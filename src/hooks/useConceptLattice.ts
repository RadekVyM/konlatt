import useProjectStore from "./stores/useProjectStore";
import { ConceptComputationRequest, ContextParsingRequest, LatticeComputationRequest, LayoutComputationRequest } from "../types/workers/LatticeWorkerRequest";
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
    const addStatusItem = useProjectStore((state) => state.addStatusItem);
    const updateStatusItem = useProjectStore((state) => state.updateStatusItem);
    const clearStatusItems = useProjectStore((state) => state.clearStatusItems);
    const workerQueue = useProjectStore((state) => state.workerQueue);

    async function setupLattice(file: File) {
        clearStatusItems();
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

        workerQueue.enqueue<ContextParsingResponse>(
            contextRequest,
            (response: ContextParsingResponse) => {
                setContext(response.context);
                updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime() });
            },
            setProgressMessage,
            undefined,
            (jobId) => addStatusItem(jobId, "File parsing", false));
        workerQueue.enqueue<ConceptComputationResponse>(
            conceptsRequest,
            (response: ConceptComputationResponse) => {
                setConcepts(response.concepts);
                updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
            },
            setProgressMessage,
            (jobId, progress) => updateStatusItem(jobId, { progress }),
            (jobId) => addStatusItem(jobId, "Concepts computation"));
        workerQueue.enqueue<LatticeComputationResponse>(
            latticeRequest,
            (response: LatticeComputationResponse) => {
                setLattice(response.lattice);
                updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
            },
            setProgressMessage,
            (jobId, progress) => updateStatusItem(jobId, { progress }),
            (jobId) => addStatusItem(jobId, "Lattice computation"));
        workerQueue.enqueue<LayoutComputationResponse>(
            layoutRequest,
            (response: LayoutComputationResponse) => {
                setLayout(response.layout);
                setDiagramOffsets(createDefaultDiagramOffsets(response.layout.length));
                setDiagramOffsetMementos({ redos: [], undos: [] });
                updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
            },
            setProgressMessage,
            undefined,
            (jobId) => addStatusItem(jobId, "Diagram layout computation"));
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