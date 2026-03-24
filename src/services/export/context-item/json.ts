import { escapeJson } from "../../../utils/string";
import { createCollapseRegions } from "../CollapseRegions";
import { INDENTATION } from "../constants";
import { escapedStringTransformer, pushArray } from "../json";

/**
 * Converts objects or attributes collection into a JSON string representation divided into a lines array.
 * Handles indentation and region tracking for UI collapsing.
 */
export function convertToJson(items: ReadonlyArray<string>, name: string, itemTypeName: "object" | "attribute") {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push("{");
    lines.push(`${INDENTATION}"name": "${escapeJson(name)}",`);

    collapseRegions.nextRegionStart = 2;

    pushArray(lines, items, itemTypeName === "object" ? "attributes" : "objects", INDENTATION, false, escapedStringTransformer);

    lines.push("}");

    return { lines, collapseRegions: collapseRegions.collapseRegions, };
}