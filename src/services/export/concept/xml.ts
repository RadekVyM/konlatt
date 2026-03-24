import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";
import { pushConcept, pushXmlDeclaration } from "../xml";

/**
 * Converts a specific formal concept into a XML string representation divided into a lines array.
 * Handles indentation and region tracking for UI collapsing.
 */
export function convertToXml(context: FormalContext, formalConcepts: FormalConcepts, conceptIndex: number) {
    const concept = formalConcepts[conceptIndex];
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushXmlDeclaration(lines, collapseRegions);

    pushConcept(lines, concept, "", context, collapseRegions, true);

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}