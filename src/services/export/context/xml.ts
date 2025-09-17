import { FormalContext } from "../../../types/FormalContext";
import { escapeXml } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { generateRelations } from "../utils";
import { escapedBodyValueTransformer, pushArray } from "../xml";

export function convertToXml(name: string, context: FormalContext) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push(`<context name="${escapeXml(name)}">`);

    collapseRegions.nextRegionStart = 1;

    pushArray(lines, context.objects, "objects", "obj", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushArray(lines, context.attributes, "attributes", "attr", INDENTATION, escapedBodyValueTransformer, collapseRegions);

    pushArray(
        lines,
        [...generateRelations(context)],
        "relation",
        "rel",
        INDENTATION,
        ([object, attribute], elementName) =>
            `<${elementName} obj="${object}" attr="${attribute}" />`,
        collapseRegions);
    
    lines.push("</context>");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}