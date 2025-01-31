import { parseBurmeister } from "../services/contextParsers";
import { ContextParsingRequest } from "../types/ContextParsingRequest";
import { ContextParsingEndResponse } from "../types/ContextParsingResponse";

const onmessage = (event: MessageEvent<ContextParsingRequest>) => {
    const content = event.data.content;

    const context = parseBurmeister(content);
    const message: ContextParsingEndResponse = {
        type: "end",
        context
    };

    postMessage(message);

    self.close();
};

addEventListener("message", onmessage);