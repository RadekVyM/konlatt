import "./style.css";
import { benchAs, benchCpp, benchJs } from "./bench";
import TheWorker from "./worker?worker";
import { RUNS_COUNT } from "./constants";

const cppButton = document.querySelector<HTMLButtonElement>("#cpp-button")!;
const cppWorkerButton = document.querySelector<HTMLButtonElement>("#cpp-worker-button")!;
const asButton = document.querySelector<HTMLButtonElement>("#as-button")!;
const asWorkerButton = document.querySelector<HTMLButtonElement>("#as-worker-button")!;
const jsButton = document.querySelector<HTMLButtonElement>("#js-button")!;
const jsWorkerButton = document.querySelector<HTMLButtonElement>("#js-worker-button")!;
const resultsList = document.querySelector<HTMLUListElement>("#results")!;

setupButtons(cppButton, cppWorkerButton, benchCpp, "cpp");
setupButtons(asButton, asWorkerButton, benchAs, "as");
setupButtons(jsButton, jsWorkerButton, benchJs, "js");

function setupButtons(
    mainButton: HTMLButtonElement,
    workerButton: HTMLButtonElement,
    benchFunc: (runsCount: number, postMessage: (message: string) => void) => Promise<void>,
    message: "cpp" | "as" | "js",
) {
    mainButton.addEventListener("click", async () => {
        clearLog();
        disableButtons();
        await benchFunc(RUNS_COUNT, (message) => resultsList.innerHTML += `<li>${message}</li>`);
        enableButtons();
    });

    workerButton.addEventListener("click", async () => {
        clearLog();
        disableButtons();
        const worker = new TheWorker();
        worker.onmessage = (event) => {
            if (event.data === "finished") {
                enableButtons();
            }
            else {
                resultsList.innerHTML += `<li>${event.data}</li>`;
            }
        };
        worker.postMessage(message);
    });
}

function clearLog() {
    resultsList.innerHTML = "";
}

function disableButtons() {
    cppButton.disabled = true;
    cppWorkerButton.disabled = true;
    asButton.disabled = true;
    asWorkerButton.disabled = true;
    jsButton.disabled = true;
    jsWorkerButton.disabled = true;
}

function enableButtons() {
    cppButton.disabled = false;
    cppWorkerButton.disabled = false;
    asButton.disabled = false;
    asWorkerButton.disabled = false;
    jsButton.disabled = false;
    jsWorkerButton.disabled = false;
}