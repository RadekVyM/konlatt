import { ContextParsingRequest } from "../types/ContextParsingRequest";
import { ContextParsingResponse } from "../types/ContextParsingResponse";

self.onmessage = async (event: MessageEvent<ContextParsingRequest>) => {
    // https://www.audjust.com/blog/wasm-and-workers
    const { parseBurmeister } = await import("../services/contextParsing");

    const context = parseBurmeister(event.data.content);
    const message: ContextParsingResponse = {
        context
    };

    self.postMessage(message);

    self.close();
};