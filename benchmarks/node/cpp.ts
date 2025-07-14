// npx vite-node ./benchmarks/node/cpp.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import Module from "../../src/cpp";

const RUNS_COUNT = 50;

const module = await Module();
const context = module.parseBurmeister(mushroomep);
let sum = 0;

for (let i = 0; i < RUNS_COUNT; i++) {
    const result = new module.FormalConceptsTimedResult();
    module.inClose(result, context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size(), undefined);

    sum += result.time;
    console.log(`[${i}] Time: ${result.time}ms`);

    result.value.delete();
    result.delete();
}

console.log(`Average time: ${sum / RUNS_COUNT}ms`);