import { RawFormalContext } from "../types/RawFormalContext";
import Module from "../wasm/cpp";
import { FormalConcept } from "../types/FormalConcepts";
import { cppFormalConceptArrayToJs, jsArrayToCppUIntArray } from "../utils/cpp";

export async function computeConcepts(context: RawFormalContext): Promise<Array<FormalConcept>> {
    const module = await Module();
    const uIntContext = jsArrayToCppUIntArray(module, context.context);
    const concepts = module.inClose(
        uIntContext,
        context.cellSize,
        context.cellsPerObject,
        context.objects.length,
        context.attributes.length
    );
    const result: Array<FormalConcept> = [...cppFormalConceptArrayToJs(concepts, true)];

    uIntContext.delete();

    return result;
}