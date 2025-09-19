import { FormalConcepts } from "../../../types/FormalConcepts";
import { escapeJson } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedStringTransformer, pushArray, pushConcepts, pushRelation } from "../json";
import { generateLatticeRelation } from "../utils";

export function convertToJson(
    objects: ReadonlyArray<string>,
    attributes: ReadonlyArray<string>,
    formalConcepts: FormalConcepts,
    name?: string,
    latticeRelation?: ReadonlyArray<Set<number>>,
) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push("{");
    collapseRegions.nextRegionStart = 1;

    if (name) {
        lines.push(`${INDENTATION}"name": "${escapeJson(name)}",`);
        collapseRegions.nextRegionStart++;
    }

    pushArray(lines, objects, "objects", INDENTATION, true, escapedStringTransformer, collapseRegions);
    pushArray(lines, attributes, "attributes", INDENTATION, true, escapedStringTransformer, collapseRegions);
    pushConcepts(lines, formalConcepts, INDENTATION, latticeRelation !== undefined, collapseRegions);

    if (latticeRelation !== undefined) {
        pushRelation(
            lines,
            generateLatticeRelation(latticeRelation),
            "lattice",
            INDENTATION,
            false,
            collapseRegions);
    }

    lines.push("}");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}