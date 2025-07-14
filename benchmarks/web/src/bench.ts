import mushroomep from "../../../datasets/mushroomep.cxt?raw";
import { __collect, inClose, parseBurmeister } from "../../as";
import Module from "../../../src/cpp";

export async function benchCpp(runsCount: number, postMessage: (message: string) => void) {
    let sum = 0;
    let sum2 = 0;
    const module = await Module();
    const context = module.parseBurmeister(mushroomep);

    for (let i = 0; i < runsCount; i++) {
        const startTime = new Date().getTime();
        const result = new module.FormalConceptsTimedResult();
        module.inClose(result, context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);
        const time2 = new Date().getTime() - startTime;

        sum += result.time;
        sum2 += time2;

        postMessage(`[${i}] Time: ${result.time}ms (${time2}ms)`);
        result.value.delete();
        result.delete();

        await new Promise((resolve) => setTimeout(resolve, 1));
    }

    postMessage(`Average time: ${sum / runsCount}ms (${sum2 / runsCount}ms)`);

    context.delete();
}

export async function benchAs(runsCount: number, postMessage: (message: string) => void) {
    let sum = 0;
    let sum2 = 0;
    const context = parseBurmeister(mushroomep);

    for (let i = 0; i < runsCount; i++) {
        const startTime = new Date().getTime();
        const result = inClose(context);
        const time2 = new Date().getTime() - startTime;
        __collect();

        sum += Number(result.time);
        sum2 += time2;

        postMessage(`[${i}] Time: ${Number(result.time)}ms (${time2}ms)`);

        await new Promise((resolve) => setTimeout(resolve, 1));
    }

    postMessage(`Average time: ${sum / runsCount}ms (${sum2 / runsCount}ms)`);
}