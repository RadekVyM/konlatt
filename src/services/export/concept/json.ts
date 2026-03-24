import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";
import { pushConcept } from "../json";

/**
 * Converts a specific formal concept into a JSON string representation divided into a lines array.
 * Handles indentation and region tracking for UI collapsing.
 */
export function convertToJson(context: FormalContext, formalConcepts: FormalConcepts, conceptIndex: number) {
    const concept = formalConcepts[conceptIndex];
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushConcept(lines, concept, "", false, context, collapseRegions, true);

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}