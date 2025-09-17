import { escapeXml } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedBodyValueTransformer, pushArray } from "../xml";

export function convertToXml(items: ReadonlyArray<string>, name: string, itemTypeName: "object" | "attribute") {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push(`<${itemTypeName} name="${escapeXml(name)}">`);

    collapseRegions.nextRegionStart = 1;

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