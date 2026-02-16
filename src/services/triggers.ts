import useProjectStore from "../stores/useProjectStore";
import { ConceptComputationRequest, ContextParsingRequest, LatticeComputationRequest, LayoutComputationRequest } from "../types/workers/MainWorkerRequest";
import { ConceptComputationResponse, ContextParsingResponse, LatticeComputationResponse, LayoutComputationResponse } from "../types/workers/MainWorkerResponse";
import useDiagramStore from "../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../stores/useDataStructuresStore";
import useExplorerStore from "../stores/explorer/useExplorerStore";
import useContextStore from "../stores/useContextStore";
import useExportAttributesStore from "../stores/export/useExportAttributesStore";
import useExportAttributeStore from "../stores/export/useExportAttributeStore";
import useExportDiagramConceptsStore from "../stores/export/concepts/useExportDiagramConceptsStore";
import useExportDiagramConceptStore from "../stores/export/concepts/useExportDiagramConceptStore";
import useExportContextStore from "../stores/export/useExportContextStore";
import useExportDiagramStore from "../stores/export/diagram/useExportDiagramStore";
import useExportObjectsStore from "../stores/export/useExportObjectsStore";
import useExportObjectStore from "../stores/export/useExportObjectStore";
import LatticeWorkerQueue from "../workers/LatticeWorkerQueue";
import toast from "../components/toast";
import { ImportFormat } from "../types/ImportFormat";
import { CsvSeparator } from "../types/CsvSeparator";
import useExportExplorerConceptsStore from "../stores/export/concepts/useExportExplorerConceptsStore";
import { DiagramLayoutState } from "../types/diagram/DiagramLayoutState";

export async function triggerInitialization(
    fileContent: string,
    format: ImportFormat,
    csvSeparator: CsvSeparator | null,
    name: string,
    onSuccess?: () => void,
    onError?: () => void,
) {
    const newWorkerQueue = new LatticeWorkerQueue();
    newWorkerQueue.setup();

    const startTime = new Date().getTime();

    enqueFileParsing(newWorkerQueue, fileContent, format, csvSeparator, (response) => {
        useProjectStore.getState().replaceWorkerQueue(newWorkerQueue);

        useProjectStore.getState().setName(response.context.name || name);
        useProjectStore.getState().clearStatusItems();
        useProjectStore.getState().addStatusItem(
            response.jobId,
            "File parsing", 
            {
                showProgress: false,
                isDone: true,
                startTime: startTime,
                endTime: new Date().getTime(),
            });

        useDataStructuresStore.getState().reset();
        useContextStore.getState().reset();
        useDiagramStore.getState().reset();
        useExplorerStore.getState().reset();

        useExportAttributesStore.getState().reset();
        useExportAttributeStore.getState().reset();
        useExportDiagramConceptsStore.getState().reset();
        useExportExplorerConceptsStore.getState().reset();
        useExportDiagramConceptStore.getState().reset();
        useExportContextStore.getState().reset();
        useExportDiagramStore.getState().reset();
        useExportObjectsStore.getState().reset();
        useExportObjectStore.getState().reset();
        useExportDiagramStore.getState().reset();

        useDataStructuresStore.getState().setContext(response.context);

        triggerConceptComputation();
        triggerLatticeComputation();
        triggerLayoutComputation({ ...useDiagramStore.getState() });

        onSuccess?.();
    }, (message) => {
        newWorkerQueue.cancelAllJobs();
        newWorkerQueue.dispose();

        // TODO: Handle this better
        toast(message || "File parsing failed");

        onError?.();
    });
}

function triggerConceptComputation() {
    const workerQueue = useProjectStore.getState().workerQueue;
    enqueueConceptComputation(workerQueue);
}

function triggerLatticeComputation() {
    const workerQueue = useProjectStore.getState().workerQueue;
    enqueueLatticeComputation(workerQueue);
}

export function triggerLayoutComputation(state: DiagramLayoutState) {
    const workerQueue = useProjectStore.getState().workerQueue;
    const currentJobId = useDiagramStore.getState().currentLayoutJobId;

    if (currentJobId !== null) {
        triggerCancellation(currentJobId);
    }

    enqueueLayoutComputation(workerQueue, state);
}

export function triggerCancellation(jobId: number) {
    useProjectStore.getState().workerQueue.cancelJob(jobId);
    useDiagramStore.getState().setCurrentLayoutJobId(null, null);
}

function enqueFileParsing(
    workerQueue: LatticeWorkerQueue,
    fileContent: string,
    format: ImportFormat,
    csvSeparator: CsvSeparator | null,
    onSuccess: (response: ContextParsingResponse) => void,
    onError: (message: string | null) => void,
) {
    const contextRequest: ContextParsingRequest = {
        type: "parse-context",
        content: fileContent,
        format,
        csvSeparator: csvSeparator || undefined,
    };

    workerQueue.enqueue<ContextParsingResponse>(
        contextRequest,
        onSuccess,
        {
            onError: (_jobId, message) => onError(message),
        });
}

function enqueueConceptComputation(workerQueue: LatticeWorkerQueue) {
    const conceptsRequest: ConceptComputationRequest = { type: "concepts" };

    workerQueue.enqueue<ConceptComputationResponse>(
        conceptsRequest,
        (response: ConceptComputationResponse) => {
            useDataStructuresStore.getState().setConcepts(response.concepts);
            useProjectStore.getState().updateStatusItem(
                response.jobId,
                { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
        },
        {
            onStatusMessage: useProjectStore.getState().setProgressMessage,
            onProgress: (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
            onStart: (jobId) => useProjectStore.getState().addStatusItem(jobId, "Concepts computation"),
            onError: (jobId, message) => {
                useProjectStore.getState().workerQueue.cancelAllJobs();
                useProjectStore.getState().workerQueue.dispose();

                useProjectStore.getState().updateStatusItem(
                    jobId,
                    {
                        title: "Failed concepts computation",
                        isDone: true,
                        isError: true,
                        endTime: new Date().getTime()
                    });
                useProjectStore.getState().setProgressMessage(null);

                toast(message || "Concept computation failed");
            },
        });
}

function enqueueLatticeComputation(workerQueue: LatticeWorkerQueue) {
    const latticeRequest: LatticeComputationRequest = { type: "lattice" };

    workerQueue.enqueue<LatticeComputationResponse>(
        latticeRequest,
        (response: LatticeComputationResponse) => {
            useDataStructuresStore.getState().setLattice(response.lattice);
            useProjectStore.getState().updateStatusItem(response.jobId, { isDone: true, endTime: new Date().getTime(), time: response.computationTime });
        },
        {
            onStatusMessage: useProjectStore.getState().setProgressMessage,
            onProgress: (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
            onStart: (jobId) => useProjectStore.getState().addStatusItem(jobId, "Lattice computation"),
            onError: (jobId, message) => {
                useProjectStore.getState().workerQueue.cancelAllJobs();
                useProjectStore.getState().workerQueue.dispose();

                useProjectStore.getState().updateStatusItem(
                    jobId,
                    { 
                        title: "Failed lattice computation",
                        isDone: true,
                        isError: true,
                        endTime: new Date().getTime()
                    });
                useProjectStore.getState().setProgressMessage(null);

                toast(message || "Lattice computation failed");
            },
        });
}

function enqueueLayoutComputation(workerQueue: LatticeWorkerQueue, state: DiagramLayoutState) {
    const layoutRequest: LayoutComputationRequest = {
        type: "layout",
        upperConeOnlyConceptIndex: state.displayHighlightedSublatticeOnly ? state.upperConeOnlyConceptIndex : null,
        lowerConeOnlyConceptIndex: state.displayHighlightedSublatticeOnly ? state.lowerConeOnlyConceptIndex : null,
        options: {
            layoutMethod: state.layoutMethod,
            parallelizeReDraw: state.parallelizeReDraw,
            targetDimensionReDraw: state.targetDimensionReDraw,
            seedReDraw: state.seedReDraw,
            placementLayered: state.placementLayered,
        },
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
        {
            onStatusMessage: useProjectStore.getState().setProgressMessage,
            onProgress: (jobId, progress) => useProjectStore.getState().updateStatusItem(jobId, { progress }),
            onStart: (jobId) => useProjectStore.getState().addStatusItem(jobId, "Diagram layout computation", { tag: "layout" }),
            onCancel: (jobId) => useProjectStore.getState().removeStatusItem(jobId),
            onError: (jobId, message) => {
                useProjectStore.getState().updateStatusItem(
                    jobId,
                    {
                        title: "Failed diagram layout computation",
                        isDone: true,
                        isError: true,
                        endTime: new Date().getTime(),
                    });
                useProjectStore.getState().setProgressMessage(null);

                toast(message || "Layout computation failed");
            },
        });

    useDiagramStore.getState().setCurrentLayoutJobId(jobId, state);
}