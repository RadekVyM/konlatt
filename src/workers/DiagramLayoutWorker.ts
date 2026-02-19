import { LayoutWorkerProgressResponse, LayoutWorkerResultResponse } from "../types/diagram/LayoutWorkerResponse";
import { Point } from "../types/Point";
import { CompleteLayoutComputationRequest } from "../types/workers/MainWorkerRequest";
import { hashString } from "../utils/string";

self.onmessage = async (event: MessageEvent<CompleteLayoutComputationRequest>) => {
    let result: {
        layout: Array<Point>,
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

    self.postMessage(response);
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
                request.subconceptsMappingArrayBuffer,
                request.options.placementLayered,
                postProgressMessage);
        case "freese":
            return await computeFreeseLayout(
                request.conceptsCount,
                request.supremum,
                request.infimum,
                request.subconceptsMappingArrayBuffer,
                postProgressMessage);
        case "redraw":
            return await computeReDrawLayout(
                request.conceptsCount,
                request.supremum,
                request.infimum,
                request.subconceptsMappingArrayBuffer,
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