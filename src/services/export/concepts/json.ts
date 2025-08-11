import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedStringTransformer, pushArray, pushConcepts } from "../json";

export function convertToJson(context: FormalContext, formalConcepts: FormalConcepts) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push("{");

    collapseRegions.nextRegionStart++;

    pushArray(lines, context.objects, "objects", INDENTATION, true, escapedStringTransformer, collapseRegions);
    pushArray(lines, context.attributes, "attributes", INDENTATION, true, escapedStringTransformer, collapseRegions);
    pushConcepts(lines, formalConcepts, INDENTATION, false, collapseRegions);

    lines.push("}");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}