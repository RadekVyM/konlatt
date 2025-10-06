import mushroomep from "../../../datasets/mushroomep.cxt?raw";
import { __collect, inClose as inCloseAs, parseBurmeister as parseBurmeisterAs } from "../../as";
import { inClose as inCloseJs } from "../../js/inClose";
import parseBurmeisterJs from "../../../src/services/parsing/burmeister"
import Module from "../../../src/cpp";
import { generateStats } from "../../stats";

export async function benchCpp(runsCount: number, postMessage: (message: string) => void) {
    const times1 = new Array<number>();
    const times2 = new Array<number>();
    const module = await Module();
    const context = module.parseBurmeister(mushroomep);

    for (let i = 0; i < runsCount; i++) {
        const startTime = new Date().getTime();
        const result = new module.FormalConceptsTimedResult();
        module.inClose(result, context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);
        const time2 = new Date().getTime() - startTime;

        times1.push(result.time);
        times2.push(time2);

        postMessage(`[${i}] Time: ${result.time}ms (${time2}ms)`);
        result.value.delete();
        result.delete();

        await new Promise((resolve) => setTimeout(resolve, 1));
    }

    postStats(times1, times2, postMessage);

    context.delete();
}

export async function benchAs(runsCount: number, postMessage: (message: string) => void) {
    const times1 = new Array<number>();
    const times2 = new Array<number>();
    const context = parseBurmeisterAs(mushroomep);

    for (let i = 0; i < runsCount; i++) {
        const startTime = new Date().getTime();
        const result = inCloseAs(context);
        const time1 = Number(result.time);
        const time2 = new Date().getTime() - startTime;
        __collect();

        times1.push(time1);
        times2.push(time2);

        postMessage(`[${i}] Time: ${time1}ms (${time2}ms)`);

        await new Promise((resolve) => setTimeout(resolve, 1));
    }

    postStats(times1, times2, postMessage);
}

export async function benchJs(runsCount: number, postMessage: (message: string) => void) {
    const times1 = new Array<number>();
    const times2 = new Array<number>();
    const context = parseBurmeisterJs(mushroomep);

    for (let i = 0; i < runsCount; i++) {
        const startTime = new Date().getTime();
        const result = inCloseJs(context);
        const time2 = new Date().getTime() - startTime;

        times1.push(result.time);
        times2.push(time2);

        postMessage(`[${i}] Time: ${result.time}ms (${time2}ms)`);

        await new Promise((resolve) => setTimeout(resolve, 1));
    }

    postStats(times1, times2, postMessage);
}

function postStats(times1: Array<number>, times2: Array<number>, postMessage: (message: string) => void) {
    const stats1 = generateStats(times1);
    const stats2 = generateStats(times2);
    postMessage(`Average time: ${stats1.average}ms (${stats2.average}ms)`);
    postMessage(`Standard deviation: ${stats1.stdDeviation}ms (${stats2.stdDeviation}ms)`);
}