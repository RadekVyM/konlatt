import { FormalContext } from "../types/FormalContext";
import Module from "../wasm/cpp";
import { cppStringArrayToJs, cppUIntArrayToJs } from "../utils/cpp";

export async function parseBurmeister(content: string): Promise<FormalContext> {
    const module = await Module();
    const context = module.parseBurmeister(content);
    const result: FormalContext = {
        context: [...cppUIntArrayToJs(context.context, true)],
        attributes: [...cppStringArrayToJs(context.attributes, true)],
        objects: [...cppStringArrayToJs(context.objects, true)],
        cellSize: context.cellSize,
        cellsPerObject: context.cellsPerObject,
    };

    context.delete();

    return result;
}