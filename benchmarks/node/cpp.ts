// npx vite-node ./benchmarks/node/cpp.ts

import mushroomep from "../../datasets/mushroomep.cxt?raw";
import Module from "../../src/wasm/cpp";

const module = await Module();

const context = module.parseBurmeister(mushroomep);
const result = module.inClose(context.context, context.cellSize, context.cellsPerObject, context.objects.size(), context.attributes.size());
console.log(result.time, "ms");