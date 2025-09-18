import { FormalConcept, FormalConcepts } from "../../../types/FormalConcepts";
import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "../constants";
import { createEmptyContext, formalContextSetAttribute, readObjectsAttributesFromXml } from "../utils";

export default function parseXmlConcepts(xmlContent: {
    context: {
        objects: any,
        attributes: any,
        concepts: any
    }
}): {
    context: FormalContext,
    concepts: FormalConcepts,
} {
    const { attributes, objects } = readObjectsAttributesFromXml(xmlContent);
    const { context, cellsPerObjectCount } = createEmptyContext(objects.length, attributes.length);
    const concepts = new Array<FormalConcept>();

    if ("concept" in xmlContent.context.concepts && Array.isArray(xmlContent.context.concepts.concept)) {
        for (let i = 0; i < xmlContent.context.concepts.concept.length; i++) {
            const concept = xmlContent.context.concepts.concept[i];
            let conceptObjects = new Array<number>();
            let conceptAttributes = new Array<number>();

            if ("objects" in concept) {
                if (typeof concept.objects === "object" && "obj" in concept.objects) {
                    if (Array.isArray(concept.objects.obj)) {
                        conceptObjects = concept.objects.obj.map((obj: any) => {
                            if (typeof obj === "number" && obj >= 0 && obj < objects.length) {
                                return obj;
                            }
                            throw new Error(`${INVALID_FILE_MESSAGE} Not all concept objects are valid.`);
                        });
                    }
                    else if (typeof concept.objects.obj === "number") {
                        conceptObjects = [concept.objects.obj];
                    }
                }
            }
            else {
                throw new Error(`${INVALID_FILE_MESSAGE} Concept objects are missing.`);
            }

            if ("attributes" in concept) {
                if (typeof concept.attributes === "object" && "attr" in concept.attributes) {
                    if (Array.isArray(concept.attributes.attr)) {
                        conceptAttributes = concept.attributes.attr.map((attr: any) => {
                            if (typeof attr === "number" && attr >= 0 && attr < attributes.length) {
                                return attr;
                            }
                            throw new Error(`${INVALID_FILE_MESSAGE} Not all concept attributes are valid.`);
                        });
                    }
                    else if (typeof concept.attributes.attr === "number") {
                        conceptAttributes = [concept.attributes.attr];
                    }
                }
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
            name: "@_name" in xmlContent.context && typeof xmlContent.context["@_name"] === "string" ?
                xmlContent.context["@_name"] :
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