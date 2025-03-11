import { RawFormalContext } from "../types/RawFormalContext";
import Module from "../cpp";
import { cppStringArrayToJs, cppUIntArrayToJs } from "../utils/cpp";

export async function parseBurmeister(content: string): Promise<RawFormalContext> {
    const module = await Module();
    const context = module.parseBurmeister(content);
    const result: RawFormalContext = {
        context: [...cppUIntArrayToJs(context.context, true)],
        attributes: [...cppStringArrayToJs(context.attributes, true)],
        objects: [...cppStringArrayToJs(context.objects, true)],
        cellSize: context.cellSize,
        cellsPerObject: context.cellsPerObject,
    };

    context.delete();

    return result;
}