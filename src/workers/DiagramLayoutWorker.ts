import { LayoutWorkerProgressResponse, LayoutWorkerResultResponse } from "../types/diagram/LayoutWorkerResponse";
import { CompleteLayoutComputationRequest } from "../types/workers/MainWorkerRequest";
import { hashString } from "../utils/string";

// Worker that handles layout comptutation
// It can be always canceled when necessary

self.onmessage = async (event: MessageEvent<CompleteLayoutComputationRequest>) => {
    let result: {
        layout: Float32Array,
        computationTime: number,
    };

    try {
        result = await computeLayout(event.data);
    }
    catch (e) {
        self.reportError(e);
        self.close();
        return;
    }

    const response: LayoutWorkerResultResponse = {
        type: "result",
        layout: result.layout,
        computationTime: result.computationTime,
    };

    self.postMessage(response, { transfer: [response.layout.buffer] });
    self.close();
}

async function computeLayout(request: CompleteLayoutComputationRequest) {
    const { computeLayeredLayout } = await import("../services/layouts/layeredLayout");
    const { computeFreeseLayout } = await import("../services/layouts/freeseLayout");
    const { computeReDrawLayout } = await import("../services/layouts/reDrawLayout");

    switch (request.options.layoutMethod) {
        case "layered":
            return await computeLayeredLayout(
                request.conceptsCount,
                request.supremum,
                request.subconceptsRelationArrayBuffer,
                request.options.placementLayered,
                postProgressMessage);
        case "freese":
            return await computeFreeseLayout(
                request.conceptsCount,
                request.supremum,
                request.infimum,
                request.subconceptsRelationArrayBuffer,
                postProgressMessage);
        case "redraw":
            return await computeReDrawLayout(
                request.conceptsCount,
                request.supremum,
                request.infimum,
                request.subconceptsRelationArrayBuffer,
                hashString(request.options.seedReDraw),
                request.options.targetDimensionReDraw,
                request.options.parallelizeReDraw,
                postProgressMessage);
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