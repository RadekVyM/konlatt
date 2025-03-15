// npx vite-node ./benchmarks/node/as.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import { __collect, inCloseBurmeister } from "../../src/wasm/as";

const result = inCloseBurmeister(mushroomep);
__collect();
console.log(Number(result.time), "ms");