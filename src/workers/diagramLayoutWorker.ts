import { CompleteLayoutComputationRequest } from "../types/WorkerRequest";

self.onmessage = async (event: MessageEvent<CompleteLayoutComputationRequest>) => {
    const result = await computeLayout(event.data);

    console.log(JSON.stringify(result.layout))

    self.postMessage(result);
    self.close();
}

async function computeLayout(request: CompleteLayoutComputationRequest) {
    const { computeLayeredLayout } = await import("../services/layouts/layeredLayout");
    const { computeFreeseLayout } = await import("../services/layouts/freeseLayout");

    switch (request.layoutMethod) {
        case "layered":
            return await computeLayeredLayout(request.conceptsCount, request.supremum, request.subconceptsMappingArrayBuffer);
        case "freese":
            return await computeFreeseLayout(request.conceptsCount, request.supremum, request.infimum, request.subconceptsMappingArrayBuffer);
        case "redraw":
        default:
            throw new Error("Not implemented");
    }
}