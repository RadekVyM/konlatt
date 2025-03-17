import { RUNS_COUNT } from "./constants";

self.onmessage = async (event: MessageEvent<"cpp" | "as">) => {
    const { benchAs, benchCpp } = await import("./bench");

    switch (event.data) {
        case "cpp":
            await benchCpp(RUNS_COUNT, (message) => self.postMessage(message));
            break;
        case "as":
            await benchAs(RUNS_COUNT, (message) => self.postMessage(message));
            break;
    }

    self.postMessage("finished");

    self.close();
}