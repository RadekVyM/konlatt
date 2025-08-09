import { FormalConcepts } from "../../../types/FormalConcepts";
import { FormalContext } from "../../../types/FormalContext";
import { INDENTATION } from "../constants";
import { pushArray, pushConcepts, pushRelations, stringTransformer } from "../json";

export function convertToJson(name: string, context: FormalContext, formalConcepts: FormalConcepts | null = null) {
    const lines = new Array<string>();

    lines.push("{");
    lines.push(`${INDENTATION}"name": "${name}"`);

    pushArray(lines, context.objects, "objects", INDENTATION, true, stringTransformer);
    pushArray(lines, context.attributes, "attributes", INDENTATION, true, stringTransformer);

    pushRelations(lines, context, INDENTATION, formalConcepts !== null);

    if (formalConcepts) {
        pushConcepts(lines, formalConcepts, INDENTATION, false);
    }

    lines.push("}");

    return lines;
}