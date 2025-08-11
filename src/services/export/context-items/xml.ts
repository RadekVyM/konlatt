import { escapedBodyValueTransformer, pushArray } from "../xml";

export function convertToXml(items: ReadonlyArray<string>, itemTypeName: "object" | "attribute") {
    const lines = new Array<string>();

    pushArray(lines, items, itemTypeName, "", escapedBodyValueTransformer);

    return lines;
}