import { FormalConcepts } from "../../../types/FormalConcepts";
import { escapeXml } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { generateLatticeRelation } from "../utils";
import { escapedBodyValueTransformer, pushArray, pushConcepts, pushXmlDeclaration } from "../xml";

export function convertToXml(
    objects: ReadonlyArray<string>,
    attributes: ReadonlyArray<string>,
    formalConcepts: FormalConcepts,
    name?: string,
    latticeRelation?: ReadonlyArray<Set<number>>,
) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushXmlDeclaration(lines, collapseRegions);

    lines.push(name ? `<context name="${escapeXml(name)}">` : "<context>");

    collapseRegions.nextRegionStart++;

    pushArray(lines, objects, "objects", "obj", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushArray(lines, attributes, "attributes", "attr", INDENTATION, escapedBodyValueTransformer, collapseRegions);
    pushConcepts(lines, formalConcepts, INDENTATION, collapseRegions);

    if (latticeRelation !== undefined) {
        pushArray(
            lines,
            [...generateLatticeRelation(latticeRelation)],
            "lattice",
            "rel",
            INDENTATION,
            ([first, second], elementName) =>
                `<${elementName} sub="${first}" sup="${second}" />`,
            collapseRegions);
    }

    lines.push("</context>");

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}