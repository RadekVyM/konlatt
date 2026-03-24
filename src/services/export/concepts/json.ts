import { FormalConcepts } from "../../../types/FormalConcepts";
import { Relation } from "../../../types/Relation";
import { escapeJson } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedStringTransformer, pushArray, pushConcepts, pushRelation } from "../json";
import { generateLatticeRelation } from "../utils";

/**
 * Converts formal concepts and optionally a lattice relation into a JSON string representation divided into a lines array.
 * Handles indentation and region tracking for UI collapsing.
 */
export function convertToJson(
    objects: ReadonlyArray<string>,
    attributes: ReadonlyArray<string>,
    formalConcepts: FormalConcepts,
    name?: string,
    latticeRelation?: Relation,
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