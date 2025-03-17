import "./style.css";
import { benchAs, benchCpp } from "./bench";
import TheWorker from "./worker?worker";
import { RUNS_COUNT } from "./constants";

const cppButton = document.querySelector<HTMLButtonElement>("#cpp-button")!;
const cppWorkerButton = document.querySelector<HTMLButtonElement>("#cpp-worker-button")!;
const asButton = document.querySelector<HTMLButtonElement>("#as-button")!;
const asWorkerButton = document.querySelector<HTMLButtonElement>("#as-worker-button")!;
const resultsList = document.querySelector<HTMLUListElement>("#results")!;

cppButton.addEventListener("click", async () => {
    clearLog();
    disableButtons();
    await benchCpp(RUNS_COUNT, (message) => resultsList.innerHTML += `<li>${message}</li>`);
    enableButtons();
});

cppWorkerButton.addEventListener("click", async () => {
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
    worker.postMessage("cpp");
});

asButton.addEventListener("click", async () => {
    clearLog();
    disableButtons();
    await new Promise((resolve) => setTimeout(resolve, 1));
    await benchAs(RUNS_COUNT, (message) => resultsList.innerHTML += `<li>${message}</li>`);
    enableButtons();
});

asWorkerButton.addEventListener("click", async () => {
    clearLog();
    disableButtons();
    await new Promise((resolve) => setTimeout(resolve, 1));
    const worker = new TheWorker();
    worker.onmessage = (event) => {
        if (event.data === "finished") {
            enableButtons();
        }
        else {
            resultsList.innerHTML += `<li>${event.data}</li>`;
        }
    };
    worker.postMessage("as");
});

function clearLog() {
    resultsList.innerHTML = "";
}

function disableButtons() {
    cppButton.disabled = true;
    cppWorkerButton.disabled = true;
    asButton.disabled = true;
    asWorkerButton.disabled = true;
}

function enableButtons() {
    cppButton.disabled = false;
    cppWorkerButton.disabled = false;
    asButton.disabled = false;
    asWorkerButton.disabled = false;
}