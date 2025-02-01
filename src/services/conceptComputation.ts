import { RawFormalContext } from "../types/RawFormalContext";
import { RawFormalConcept } from "../types/RawFormalConcept";
import { __collect, inClose as inCloseAs } from "../as";

export function computeConcepts(context: RawFormalContext): Array<RawFormalConcept> {
    const concepts = inCloseAs(context) as Array<RawFormalConcept>;
    __collect();
    return concepts;
}