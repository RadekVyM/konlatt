import { escapedStringTransformer, pushArray } from "../json";

export function convertToJson(items: ReadonlyArray<string>) {
    const lines = new Array<string>();

    pushArray(lines, items, null, "", false, escapedStringTransformer);

    return lines;
}