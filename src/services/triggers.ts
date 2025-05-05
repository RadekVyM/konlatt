import useProjectStore from "../stores/useProjectStore";
import { ConceptComputationRequest, ContextParsingRequest, LatticeComputationRequest, LayoutComputationRequest } from "../types/WorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, LatticeComputationResponse, LayoutComputationResponse } from "../types/WorkerResponse";
import useDiagramStore from "../stores/useDiagramStore";
import useDataStructuresStore from "../stores/useDataStructuresStore";
import useExplorerStore from "../stores/useExplorerStore";
import { DiagramLayoutState } from "../types/DiagramLayoutState";

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
    triggerLayoutComputation({ ...useDiagramStore.getState() });
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

export function triggerLayoutComputation(state: DiagramLayoutState) {
    const workerQueue = useProjectStore.getState().workerQueue;
    const currentJobId = useDiagramStore.getState().currentLayoutJobId;

    if (currentJobId !== null) {
        triggerCancellation(currentJobId);
    }

    const layoutRequest: LayoutComputationRequest = {
        type: "layout",
        upperConeOnlyConceptIndex: state.displayHighlightedSublatticeOnly ? state.upperConeOnlyConceptIndex : null,
        lowerConeOnlyConceptIndex: state.displayHighlightedSublatticeOnly ? state.lowerConeOnlyConceptIndex : null,
    };

    const jobId = workerQueue.enqueue<LayoutComputationResponse>(
        layoutRequest,
        (response: LayoutComputationResponse) => {
            if (useDiagramStore.getState().currentLayoutJobId !== response.jobId) {
                // Job was cancelled during the data transfer
                return;
            }

            useDiagramStore.getState().setLayout(response.layout);
            useDiagramStore.getState().setCurrentLayoutJobId(null, null);
            useProjectStore.getState().updateStatusItem(
                response.jobId,
                { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
        },
        useProjectStore.getState().setProgressMessage,
        (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
        (jobId) => useProjectStore.getState().addStatusItem(jobId, "Diagram layout computation"),
        (jobId) => useProjectStore.getState().removeStatusItem(jobId));

    useDiagramStore.getState().setCurrentLayoutJobId(jobId, state);
}

export function triggerCancellation(jobId: number) {
    useProjectStore.getState().workerQueue.cancelJob(jobId);
    useDiagramStore.getState().setCurrentLayoutJobId(null, null);
}