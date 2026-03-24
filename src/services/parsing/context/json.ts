import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "../constants";
import { createEmptyContext, formalContextSetAttribute, readObjectsAttributesFromJson } from "../utils";

/**
 * Parses a JSON object into a `FormalContext`.
 * Validates the input JSON for objects, attributes, and their relation,
 * ensuring all indexes are within bounds and formatting is correct.
 */
export default function parseJsonContext(jsonContent: {
    objects: any,
    attributes: any,
    relation: any,
}): FormalContext {
    const { attributes, objects } = readObjectsAttributesFromJson(jsonContent);
    const { context, cellsPerObjectCount } = createEmptyContext(objects.length, attributes.length);

    if (Array.isArray(jsonContent.relation)) {
        for (const relation of jsonContent.relation) {
            if (!Array.isArray(relation) || relation.length !== 2) {
                throw new Error(`${INVALID_FILE_MESSAGE} Invalid relation format.`);
            }

            const obj = relation[0];
            const attr = relation[1];

            if ((typeof obj === "number" && obj >= 0 && obj < objects.length) &&
                (typeof attr === "number" && attr >= 0 && attr < attributes.length)) {
                formalContextSetAttribute(context, cellsPerObjectCount, obj, attr);
            }
            else {
                throw new Error(`${INVALID_FILE_MESSAGE} Invalid relation format.`);
            }
        }
    }

    return {
        name: "name" in jsonContent && typeof jsonContent.name === "string" ?
            jsonContent.name :
            undefined,
        relation: context,
        objects,
        attributes,
        cellsPerObject: cellsPerObjectCount,
        cellSize: FORMAL_CONTEXT_CELL_SIZE,
    };
}