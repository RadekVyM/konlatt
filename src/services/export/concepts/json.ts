import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { INDENTATION } from "../constants";
import { CollapseRegions, pushArray, pushConcepts, stringTransformer } from "../json";

export function convertToJson(context: FormalContext, formalConcepts: FormalConcepts) {
    const lines = new Array<string>();
    const collapseRegions: CollapseRegions = {
        collapseRegions: new Map(),
        nextRegionStart: 0,
    };

    lines.push("{");

    collapseRegions.nextRegionStart++;

    pushArray(lines, context.objects, "objects", INDENTATION, true, stringTransformer, collapseRegions);
    pushArray(lines, context.attributes, "attributes", INDENTATION, true, stringTransformer, collapseRegions);
    pushConcepts(lines, formalConcepts, INDENTATION, false, collapseRegions);

    lines.push("}");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}