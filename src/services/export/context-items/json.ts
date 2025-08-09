import { pushArray, stringTransformer } from "../json";

export function convertToJson(items: ReadonlyArray<string>) {
    const lines = new Array<string>();

    pushArray(lines, items, null, "", false, stringTransformer);

    return lines;
}