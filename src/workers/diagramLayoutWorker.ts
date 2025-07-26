import { LayoutWorkerProgressResponse, LayoutWorkerResultResponse } from "../types/LayoutWorkerResponse";
import { CompleteLayoutComputationRequest } from "../types/WorkerRequest";

self.onmessage = async (event: MessageEvent<CompleteLayoutComputationRequest>) => {
    const result = await computeLayout(event.data);

    console.log(JSON.stringify(result.layout));

    const response: LayoutWorkerResultResponse = {
        type: "result",
        layout: result.layout,
        computationTime: result.computationTime,
    };

    self.postMessage(response);
    self.close();
}

async function computeLayout(request: CompleteLayoutComputationRequest) {
    const { computeLayeredLayout } = await import("../services/layouts/layeredLayout");
    const { computeFreeseLayout } = await import("../services/layouts/freeseLayout");
    const { computeReDrawLayout } = await import("../services/layouts/reDrawLayout");

    switch (request.layoutMethod) {
        case "layered":
            return await computeLayeredLayout(request.conceptsCount, request.supremum, request.subconceptsMappingArrayBuffer);
        case "freese":
            return await computeFreeseLayout(request.conceptsCount, request.supremum, request.infimum, request.subconceptsMappingArrayBuffer, postProgressMessage);
        case "redraw":
            return await computeReDrawLayout(request.conceptsCount, request.supremum, request.infimum, request.subconceptsMappingArrayBuffer, postProgressMessage);
        default:
            throw new Error("Not implemented");
    }
}

function postProgressMessage(progress: number) {
    const progressResponse: LayoutWorkerProgressResponse = {
        type: "progress",
        progress
    };

    self.postMessage(progressResponse);
}
