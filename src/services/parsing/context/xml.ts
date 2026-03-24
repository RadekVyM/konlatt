import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "../constants";
import { createEmptyContext, formalContextSetAttribute, readObjectsAttributesFromXml } from "../utils";

/**
 * Parses a structured XML-to-JS object into a `FormalContext`.
 * Validates the input JSON for objects, attributes, and their relation,
 * ensuring all indexes are within bounds and formatting is correct.
 */
export default function parseXmlContext(xmlContent: {
    context: {
        objects: any,
        attributes: any,
        relation: any,
    }
}): FormalContext {
    const { objects, attributes } = readObjectsAttributesFromXml(xmlContent);
    const { context, cellsPerObjectCount } = createEmptyContext(objects.length, attributes.length);

    if ("rel" in xmlContent.context.relation && Array.isArray(xmlContent.context.relation.rel)) {
        for (const relation of xmlContent.context.relation.rel) {
            if (!("@_obj" in relation && "@_attr" in relation)) {
                throw new Error(`${INVALID_FILE_MESSAGE} Invalid relation format.`);
            }

            const obj = parseInt(relation["@_obj"]);
            const attr = parseInt(relation["@_attr"]);

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
        name: "@_name" in xmlContent.context && typeof xmlContent.context["@_name"] === "string" ?
            xmlContent.context["@_name"] :
            undefined,
        relation: context,
        objects,
        attributes,
        cellsPerObject: cellsPerObjectCount,
        cellSize: FORMAL_CONTEXT_CELL_SIZE,
    };
}