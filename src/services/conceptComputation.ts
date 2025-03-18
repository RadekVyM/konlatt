import { RawFormalContext } from "../types/RawFormalContext";
import Module from "../wasm/cpp";
import { FormalConcept } from "../types/FormalConcepts";
import { cppFormalConceptArrayToJs, jsArrayToCppUIntArray } from "../utils/cpp";

export async function computeConcepts(context: RawFormalContext, onProgress?: (progress: number) => void): Promise<Array<FormalConcept>> {
    const module = await Module();
    const uIntContext = jsArrayToCppUIntArray(module, context.context);
    const result = module.inClose(
        uIntContext,
        context.cellSize,
        context.cellsPerObject,
        context.objects.length,
        context.attributes.length,
        onProgress);
    const concepts: Array<FormalConcept> = [...cppFormalConceptArrayToJs(result.value, true)];
    console.log(`InClose: ${result.time}ms`);

    uIntContext.delete();

    return concepts;
}