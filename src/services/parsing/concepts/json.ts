import { FormalConcept, FormalConcepts } from "../../../types/FormalConcepts";
import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "../constants";
import { createEmptyContext, formalContextSetAttribute, readObjectsAttributesFromJson } from "../utils";

export default function parseJsonConcepts(jsonContent: {
    objects: any,
    attributes: any,
    concepts: any,
}): {
    context: FormalContext,
    concepts: FormalConcepts,
} {
    const { attributes, objects } = readObjectsAttributesFromJson(jsonContent);
    const { context, cellsPerObjectCount } = createEmptyContext(objects.length, attributes.length);
    const concepts = new Array<FormalConcept>();

    if (Array.isArray(jsonContent.concepts)) {
        for (let i = 0; i < jsonContent.concepts.length; i++) {
            const concept = jsonContent.concepts[i];
            let conceptObjects = new Array<number>();
            let conceptAttributes = new Array<number>();

            if ("objects" in concept && Array.isArray(concept.objects)) {
                conceptObjects = concept.objects.map((obj: any) => {
                    if (typeof obj === "number" && obj >= 0 && obj < objects.length) {
                        return obj;
                    }
                    throw new Error(`${INVALID_FILE_MESSAGE} Not all concept objects are valid.`);
                });
            }
            else {
                throw new Error(`${INVALID_FILE_MESSAGE} Concept objects are missing.`);
            }

            if ("attributes" in concept && Array.isArray(concept.attributes)) {
                conceptAttributes = concept.attributes.map((attr: any) => {
                    if (typeof attr === "number" && attr >= 0 && attr < attributes.length) {
                        return attr;
                    }
                    throw new Error(`${INVALID_FILE_MESSAGE} Not all concept attributes are valid.`);
                });
            }
            else {
                throw new Error(`${INVALID_FILE_MESSAGE} Concept attributes are missing.`);
            }

            concepts.push({
                index: i,
                objects: conceptObjects,
                attributes: conceptAttributes,
            });

            for (const obj of conceptObjects) {
                for (const attr of conceptAttributes) {
                    formalContextSetAttribute(context, cellsPerObjectCount, obj, attr);
                }
            }
        }
    }
    else {
        throw new Error(`${INVALID_FILE_MESSAGE} Concepts are missing.`);
    }

    return {
        context: {
            name: "name" in jsonContent && typeof jsonContent.name === "string" ?
                jsonContent.name :
                undefined,
            context,
            objects,
            attributes,
            cellsPerObject: cellsPerObjectCount,
            cellSize: FORMAL_CONTEXT_CELL_SIZE,
        },
        concepts,
    };
}