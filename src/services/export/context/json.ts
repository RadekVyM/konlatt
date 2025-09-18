import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { escapeJson } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedStringTransformer, pushArray, pushConcepts, pushRelation } from "../json";

export function convertToJson(name: string, context: FormalContext, formalConcepts: FormalConcepts | null = null) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push("{");
    lines.push(`${INDENTATION}"name": "${escapeJson(name)}",`);

    collapseRegions.nextRegionStart = 2;

    pushArray(lines, context.objects, "objects", INDENTATION, true, escapedStringTransformer, collapseRegions);
    pushArray(lines, context.attributes, "attributes", INDENTATION, true, escapedStringTransformer, collapseRegions);

    pushRelation(lines, context, INDENTATION, formalConcepts !== null, collapseRegions);

    if (formalConcepts) {
        pushConcepts(lines, formalConcepts, INDENTATION, false, collapseRegions);
    }

    lines.push("}");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}