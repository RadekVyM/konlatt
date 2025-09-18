import { escapedBodyValueTransformer, pushArray, pushXmlDeclaration } from "../xml";

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