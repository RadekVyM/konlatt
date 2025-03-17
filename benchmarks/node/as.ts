// npx vite-node ./benchmarks/node/as.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import { __collect, inClose, parseBurmeister } from "../../src/wasm/as";

const RUNS_COUNT = 50;

const context = parseBurmeister(mushroomep);
let sum = 0;

for (let i = 0; i < RUNS_COUNT; i++) {
    const result = inClose(context);
    sum += Number(result.time);
    console.log(`[${i}] Time: ${Number(result.time)}ms`);
    __collect();
}

console.log(`Average time: ${sum / RUNS_COUNT}ms`);