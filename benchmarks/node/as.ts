// npx vite-node@5.3.0 ./benchmarks/node/as.ts

// The older version of Vite Node needs to be used because the new Vite bundler (Rolldown)
// does not like the way AssemblyScript exports things to modules

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import * as wasm from "../as";
import { generateStats } from "../stats";

const { __collect, inClose, parseBurmeister } = wasm;

const RUNS_COUNT = 50;

const context = parseBurmeister(mushroomep);
const times = new Array<number>();

for (let i = 0; i < RUNS_COUNT; i++) {
    const result = inClose(context);
    const time = Number(result.time);
    times.push(time);
    console.log(`[${i}] Time: ${time}ms`);
    __collect();
}

const stats = generateStats(times);
console.log(`Average time: ${stats.average}ms`);
console.log(`Standard deviation: ${stats.stdDeviation}ms`);