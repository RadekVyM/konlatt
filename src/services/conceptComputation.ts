import { FormalContext } from "../types/FormalContext";
import Module from "../cpp";
import { FormalConcept } from "../types/FormalConcepts";
import { cppFormalConceptArrayToJs, jsArrayToCppUIntArray } from "../utils/cpp";

export async function computeConcepts(context: FormalContext, onProgress?: (progress: number) => void): Promise<{
    concepts: Array<FormalConcept>,
    computationTime: number,
}> {
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

    return {
        concepts,
        computationTime: result.time,
    };
}