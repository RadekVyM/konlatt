import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedBodyValueTransformer, pushArray, pushConcepts } from "../xml";

export function convertToXml(context: FormalContext, formalConcepts: FormalConcepts) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push("<context>");

    collapseRegions.nextRegionStart++;

    pushArray(lines, context.objects, "objects", "obj", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushArray(lines, context.attributes, "attributes", "attr", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushConcepts(lines, formalConcepts, INDENTATION, collapseRegions);

    lines.push("</context>");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}