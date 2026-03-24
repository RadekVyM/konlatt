import { escapedStringTransformer, pushArray } from "../json";

/**
 * Converts objects or attributes collection into a JSON string representation divided into a lines array.
 * Handles indentation.
 */
export function convertToJson(items: ReadonlyArray<string>) {
    const lines = new Array<string>();

    pushArray(lines, items, null, "", false, escapedStringTransformer);

    return lines;
}