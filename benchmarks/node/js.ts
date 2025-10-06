// npx vite-node ./benchmarks/node/js.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import parseBurmeister from "../../src/services/parsing/burmeister";
import { inClose } from "../js/inClose";
import { generateStats } from "../stats";

const RUNS_COUNT = 50;

const context = parseBurmeister(mushroomep);
const times = new Array<number>();

for (let i = 0; i < RUNS_COUNT; i++) {
    const result = inClose(context);
    times.push(result.time);
    console.log(`[${i}] Time: ${result.time}ms`);
}

const stats = generateStats(times);
console.log(`Average time: ${stats.average}ms`);
console.log(`Standard deviation: ${stats.stdDeviation}ms`);