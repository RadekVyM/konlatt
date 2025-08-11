import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";
import { pushConcept } from "../xml";

export function convertToXml(context: FormalContext, formalConcepts: FormalConcepts, conceptIndex: number) {
    const concept = formalConcepts[conceptIndex];
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    pushConcept(lines, concept, "", context, collapseRegions, true);

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}