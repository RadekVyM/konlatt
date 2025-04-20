import { CompleteLayoutComputationRequest } from "../types/WorkerRequest";

self.onmessage = async (event: MessageEvent<CompleteLayoutComputationRequest>) => {
    const { computeLayeredLayout } = await import("../services/layouts/layeredLayout");
    const result = await computeLayeredLayout(event.data.conceptsCount, event.data.supremum, event.data.subconceptsMappingArrayBuffer);

    self.postMessage(result);
    self.close();
}