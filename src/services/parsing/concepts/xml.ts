import { ConceptLattice } from "../../../types/ConceptLattice";
import { FormalConcept, FormalConcepts } from "../../../types/FormalConcepts";
import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { getAttributesLabeling, getObjectsLabeling } from "../../lattice";
import { INVALID_FILE_MESSAGE } from "../constants";
import { createEmptyContext, formalContextSetAttribute, readObjectsAttributesFromXml } from "../utils";

export default function parseXmlConcepts(xmlContent: {
    context: {
        objects: any,
        attributes: any,
        concepts: any,
        lattice?: any,
    }
}): {
    context: FormalContext,
    concepts: FormalConcepts,
    lattice?: ConceptLattice,
} {
    const { attributes, objects } = readObjectsAttributesFromXml(xmlContent);
    const { context, cellsPerObjectCount } = createEmptyContext(objects.length, attributes.length);
    const concepts = new Array<FormalConcept>();

    if ("concept" in xmlContent.context.concepts && Array.isArray(xmlContent.context.concepts.concept)) {
        for (let i = 0; i < xmlContent.context.concepts.concept.length; i++) {
            const concept = xmlContent.context.concepts.concept[i];
            const { conceptObjects, conceptAttributes } = readConceptObjectsAttributes(concept, objects.length, attributes.length);

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

    let lattice: ConceptLattice | undefined = undefined;

    if ("lattice" in xmlContent.context && "rel" in xmlContent.context.lattice && Array.isArray(xmlContent.context.lattice.rel)) {
        lattice = tryReadLattice(concepts, xmlContent.context.lattice.rel);
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
        lattice,
    };
}

function readConceptObjectsAttributes(concept: any, objectsCount: number, attributesCount: number) {
    let conceptObjects = new Array<number>();
    let conceptAttributes = new Array<number>();

    if ("objects" in concept) {
        if (typeof concept.objects === "object" && "obj" in concept.objects) {
            if (Array.isArray(concept.objects.obj)) {
                conceptObjects = concept.objects.obj.map((obj: any) => {
                    if (typeof obj === "number" && obj >= 0 && obj < objectsCount) {
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
                    if (typeof attr === "number" && attr >= 0 && attr < attributesCount) {
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
    return { conceptObjects, conceptAttributes };
}

function tryReadLattice(
    concepts: FormalConcepts,
    xmlLattice: Array<any>,
): ConceptLattice {
    const subconceptsMapping = new Array<Set<number>>(concepts.length);
    const superconceptsMapping = new Array<Set<number>>(concepts.length);

    for (const relation of xmlLattice) {
        if (!("@_sub" in relation && "@_sup" in relation)) {
            throw new Error(`${INVALID_FILE_MESSAGE} Invalid lattice relation format.`);
        }

        const sub = parseInt(relation["@_sub"]);
        const sup = parseInt(relation["@_sup"]);

        if ((typeof sub === "number" && sub >= 0 && sub < concepts.length) &&
            (typeof sup === "number" && sup >= 0 && sup < concepts.length)) {
            if (subconceptsMapping[sup] === undefined) {
                subconceptsMapping[sup] = new Set([sub]);
            }
            else {
                subconceptsMapping[sup].add(sub);
            }

            if (superconceptsMapping[sub] === undefined) {
                superconceptsMapping[sub] = new Set([sup]);
            }
            else {
                superconceptsMapping[sub].add(sup);
            }
        }
        else {
            throw new Error(`${INVALID_FILE_MESSAGE} Invalid lattice relation format.`);
        }
    }

    for (let i = 0; i < concepts.length; i++) {
        if (subconceptsMapping[i] === undefined) {
            subconceptsMapping[i] = new Set();
        }
        if (superconceptsMapping[i] === undefined) {
            superconceptsMapping[i] = new Set();
        }
    }

    return {
        subconceptsMapping,
        superconceptsMapping,
        objectsLabeling: getObjectsLabeling(concepts, superconceptsMapping),
        attributesLabeling: getAttributesLabeling(concepts, subconceptsMapping),
    };
}