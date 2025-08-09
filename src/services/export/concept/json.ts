import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { pushConcept } from "../json";

export function convertToJson(context: FormalContext, formalConcepts: FormalConcepts, conceptIndex: number) {
    const concept = formalConcepts[conceptIndex];
    const lines = new Array<string>();

    pushConcept(lines, concept, "", false, context);

    return lines;
}