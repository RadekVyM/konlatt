import { escapeXml } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedBodyValueTransformer, pushArray, pushXmlDeclaration } from "../xml";

export function convertToXml(items: ReadonlyArray<string>, name: string, itemTypeName: "object" | "attribute") {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushXmlDeclaration(lines, collapseRegions);

    lines.push(`<${itemTypeName} name="${escapeXml(name)}">`);

    collapseRegions.nextRegionStart++;

    pushArray(
        lines,
        items,
        `${itemTypeName === "object" ? "attribute" : "object"}s`,
        itemTypeName === "object" ? "attr" : "obj",
        INDENTATION,
        escapedBodyValueTransformer);

    lines.push(`</${itemTypeName}>`);

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}