import { escapedBodyValueTransformer, pushArray, pushXmlDeclaration } from "../xml";

/**
 * Converts objects or attributes collection into a XML string representation divided into a lines array.
 * Handles indentation.
 */
export function convertToXml(items: ReadonlyArray<string>, itemTypeName: "object" | "attribute") {
    const lines = new Array<string>();

    pushXmlDeclaration(lines);

    pushArray(
        lines,
        items,
        `${itemTypeName}s`,
        itemTypeName === "attribute" ? "attr" : "obj",
        "",
        escapedBodyValueTransformer);

    return lines;
}