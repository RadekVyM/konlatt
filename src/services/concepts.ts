import { FormalContext } from "../types/FormalContext";
import Module from "../cpp";
import { FormalConcept } from "../types/FormalConcepts";
import { cppFormalConceptArrayToJs, jsArrayToCppUIntArray } from "../utils/cpp";

/**
 * Computes the set of formal concepts for a given formal context using the InClose algorithm via WebAssembly.
 * @param context - The formal context.
 * @param onProgress - Optional callback to track the computation progress (0.0 to 1.0).
 * @returns A promise resolving to the list of computed concepts and the execution time in milliseconds.
 */
export async function computeConcepts(context: FormalContext, onProgress?: (progress: number) => void): Promise<{
    concepts: ReadonlyArray<FormalConcept>,
    computationTime: number,
}> {
    const module = await Module();
    const uIntContext = jsArrayToCppUIntArray(module, context.relation);
    const result = new module.FormalConceptsTimedResult();

    module.inClose(
        result,
        uIntContext,
        context.cellSize,
        context.cellsPerObject,
        context.objects.length,
        context.attributes.length,
        onProgress);

    const concepts: ReadonlyArray<FormalConcept> = [...cppFormalConceptArrayToJs(result.value, true)];
    const computationTime = result.time;
    console.log(`InClose: ${computationTime}ms`);

    uIntContext.delete();
    result.delete();

    return {
        concepts,
        computationTime,
    };
}