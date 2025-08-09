import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { INDENTATION } from "../constants";
import { pushArray, pushConcepts, stringTransformer } from "../json";

export function convertToJson(context: FormalContext, formalConcepts: FormalConcepts) {
    const lines = new Array<string>();

    lines.push("{");

    pushArray(lines, context.objects, "objects", INDENTATION, true, stringTransformer);
    pushArray(lines, context.attributes, "attributes", INDENTATION, true, stringTransformer);
    pushConcepts(lines, formalConcepts, INDENTATION, false);

    lines.push("}");

    return lines;
}