// npx vite-node ./benchmarks/node/as.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import { __collect, inClose, parseBurmeister } from "../as";
import { generateStats } from "../stats";

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