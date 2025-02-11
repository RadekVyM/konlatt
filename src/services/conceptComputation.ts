import { RawFormalContext } from "../types/RawFormalContext";
import { __collect, inClose as inCloseAs } from "../as";
import { FormalConcept } from "../types/FormalConcepts";
import { RawFormalConcept } from "../types/RawFormalConcept";

export function computeConcepts(context: RawFormalContext): Array<FormalConcept> {
    const concepts = inCloseAs(context) as Array<RawFormalConcept>;
    __collect();

    const result: Array<FormalConcept> = concepts.map((c, index) => ({
        objects: c.objects,
        attributes: c.attributes,
        index,
    }));
    return result;
}