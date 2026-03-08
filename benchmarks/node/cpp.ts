// npx vite-node ./benchmarks/node/cpp.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import Module from "../../src/cpp";
import { generateStats } from "../stats";
import parseBurmeister from "../../src/services/parsing/burmeister";
import { jsArrayToCppUIntArray } from "../../src/utils/cpp";

const RUNS_COUNT = 50;

const module = await Module();
const context = parseBurmeister(mushroomep);
const uIntContext = jsArrayToCppUIntArray(module, context.relation);
const times = new Array<number>();

for (let i = 0; i < RUNS_COUNT; i++) {
    const result = new module.FormalConceptsTimedResult();

    module.inClose(
        result,
        uIntContext,
        context.cellSize,
        context.cellsPerObject,
        context.objects.length,
        context.attributes.length,
        undefined);

    times.push(result.time);
    console.log(`[${i}] Time: ${result.time}ms`);

    result.value.delete();
    result.delete();
}

const stats = generateStats(times);
console.log(`Average time: ${stats.average}ms`);
console.log(`Standard deviation: ${stats.stdDeviation}ms`);

uIntContext.delete();