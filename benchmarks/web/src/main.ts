import "./style.css";
import mushroomep from "../../../datasets/mushroomep.cxt?raw";
import { __collect, inCloseBurmeister } from "../../../src/wasm/as";
import Module from "../../../src/wasm/cpp";

const cppButton = document.querySelector<HTMLButtonElement>("#cpp-button")!;
const asButton = document.querySelector<HTMLButtonElement>("#as-button")!;
const resultsList = document.querySelector<HTMLUListElement>("#results")!;

cppButton.addEventListener("click", async () => {
    disableButtons();

    const startTime = new Date().getTime();
    const module = await Module();
    const context = module.parseBurmeister(mushroomep);
    const concepts = module.inClose(context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size());

    resultsList.innerHTML += `<li>${concepts.time}ms (${new Date().getTime() - startTime}ms)</li>`;

    context.delete();
    concepts.value.delete();

    enableButtons();
});

asButton.addEventListener("click", async () => {
    disableButtons();

    await new Promise((resolve) => setTimeout(resolve, 1));

    const startTime = new Date().getTime();
    const result = inCloseBurmeister(mushroomep);
    __collect();

    resultsList.innerHTML += `<li>${Number(result.time)}ms (${new Date().getTime() - startTime}ms)</li>`;

    enableButtons();
});

function disableButtons() {
    cppButton.disabled = true;
    asButton.disabled = true;
}

function enableButtons() {
    cppButton.disabled = false;
    asButton.disabled = false;
}