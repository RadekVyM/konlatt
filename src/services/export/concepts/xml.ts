import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { escapeXml } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedBodyValueTransformer, pushArray, pushConcepts, pushXmlDeclaration } from "../xml";

export function convertToXml(context: FormalContext, formalConcepts: FormalConcepts, name?: string) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushXmlDeclaration(lines, collapseRegions);

    lines.push(name ? `<context name="${escapeXml(name)}">` : "<context>");

    collapseRegions.nextRegionStart++;

    pushArray(lines, context.objects, "objects", "obj", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushArray(lines, context.attributes, "attributes", "attr", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushConcepts(lines, formalConcepts, INDENTATION, collapseRegions);

    lines.push("</context>");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}