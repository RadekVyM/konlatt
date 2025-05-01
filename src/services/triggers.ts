import useProjectStore from "../stores/useProjectStore";
import { ConceptComputationRequest, ContextParsingRequest, LatticeComputationRequest, LayoutComputationRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, LatticeComputationResponse, LayoutComputationResponse } from "../types/WorkerResponse";
import { createPoint, Point } from "../types/Point";
import useDiagramStore from "../stores/useDiagramStore";
import useDataStructuresStore from "../stores/useDataStructuresStore";
import useExplorerStore from "../stores/useExplorerStore";

export async function triggerInitialization(file: File) {
    useProjectStore.getState().clearStatusItems();
    useDataStructuresStore.getState().reset();
    useDiagramStore.getState().reset();
    useExplorerStore.getState().reset();
    useProjectStore.getState().setFile(file);

    const fileContent = await file.text();

    useProjectStore.getState().workerQueue.reset();

    triggerFileParsing(fileContent);
    triggerConceptComputation();
    triggerLatticeComputation();
    triggerLayoutComputation();
}

function triggerFileParsing(fileContent: string) {
    const workerQueue = useProjectStore.getState().workerQueue;
    const contextRequest: ContextParsingRequest = { type: "parse-context", content: fileContent };

    workerQueue.enqueue<ContextParsingResponse>(
        contextRequest,
        (response: ContextParsingResponse) => {
            useDataStructuresStore.getState().setContext(response.context);
            useProjectStore.getState().updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime() });
        },
        useProjectStore.getState().setProgressMessage,
        undefined,
        (jobId) => useProjectStore.getState().addStatusItem(jobId, "File parsing", false));
}

function triggerConceptComputation() {
    const workerQueue = useProjectStore.getState().workerQueue;
    const conceptsRequest: ConceptComputationRequest = { type: "concepts" };

    workerQueue.enqueue<ConceptComputationResponse>(
        conceptsRequest,
        (response: ConceptComputationResponse) => {
            useDataStructuresStore.getState().setConcepts(response.concepts);
            useProjectStore.getState().updateStatusItem(
                response.jobId,
                { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
        },
        useProjectStore.getState().setProgressMessage,
        (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
        (jobId) => useProjectStore.getState().addStatusItem(jobId, "Concepts computation"));
}

function triggerLatticeComputation() {
    const workerQueue = useProjectStore.getState().workerQueue;
    const latticeRequest: LatticeComputationRequest = { type: "lattice" };

    workerQueue.enqueue<LatticeComputationResponse>(
        latticeRequest,
        (response: LatticeComputationResponse) => {
            useDataStructuresStore.getState().setLattice(response.lattice);
            useProjectStore.getState().updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
        },
        useProjectStore.getState().setProgressMessage,
        (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
        (jobId) => useProjectStore.getState().addStatusItem(jobId, "Lattice computation"));
}

function triggerLayoutComputation() {
    const workerQueue = useProjectStore.getState().workerQueue;
    const currentJobId = useDiagramStore.getState().currentLayoutJobId;

    if (currentJobId !== null) {
        workerQueue.cancelJob(currentJobId);
    }

    const layoutRequest: LayoutComputationRequest = { type: "layout" };

    const jobId = workerQueue.enqueue<LayoutComputationResponse>(
        layoutRequest,
        (response: LayoutComputationResponse) => {
            useDiagramStore.getState().setLayout(response.layout);
            useDiagramStore.getState().setCurrentLayoutJobId(null);
            useDiagramStore.getState().setDiagramOffsets(createDefaultDiagramOffsets(response.layout.length));
            useDiagramStore.getState().setDiagramOffsetMementos({ redos: [], undos: [] });
            useProjectStore.getState().updateStatusItem(
                response.jobId,
                { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
        },
        useProjectStore.getState().setProgressMessage,
        (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
        (jobId) => useProjectStore.getState().addStatusItem(jobId, "Diagram layout computation"));

    useDiagramStore.getState().setCurrentLayoutJobId(jobId);
}

function createDefaultDiagramOffsets(length: number) {
    const offsets = new Array<Point>(length);

    for (let i = 0; i < length; i++) {
        offsets[i] = createPoint(0, 0, 0);
    }

    return offsets;
}