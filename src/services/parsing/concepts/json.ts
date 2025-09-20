import { ConceptLattice } from "../../../types/ConceptLattice";
import { FormalConcept, FormalConcepts } from "../../../types/FormalConcepts";
import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { getAttributesLabeling, getObjectsLabeling } from "../../lattice";
import { INVALID_FILE_MESSAGE } from "../constants";
import { createEmptyContext, formalContextSetAttribute, readObjectsAttributesFromJson } from "../utils";

export default function parseJsonConcepts(jsonContent: {
    objects: any,
    attributes: any,
    concepts: any,
}): {
    context: FormalContext,
    concepts: FormalConcepts,
    lattice?: ConceptLattice,
} {
    const { attributes, objects } = readObjectsAttributesFromJson(jsonContent);
    const { context, cellsPerObjectCount } = createEmptyContext(objects.length, attributes.length);
    const concepts = new Array<FormalConcept>();

    if (Array.isArray(jsonContent.concepts)) {
        for (let i = 0; i < jsonContent.concepts.length; i++) {
            const concept = jsonContent.concepts[i];
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

    if ("lattice" in jsonContent && Array.isArray(jsonContent.lattice)) {
        lattice = tryReadLattice(concepts, jsonContent.lattice);
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
        lattice,
    };
}

function readConceptObjectsAttributes(concept: any, objectsCount: number, attributesCount: number) {
    let conceptObjects = new Array<number>();
    let conceptAttributes = new Array<number>();

    if ("objects" in concept && Array.isArray(concept.objects)) {
        conceptObjects = concept.objects.map((obj: any) => {
            if (typeof obj === "number" && obj >= 0 && obj < objectsCount) {
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
            if (typeof attr === "number" && attr >= 0 && attr < attributesCount) {
                return attr;
            }
            throw new Error(`${INVALID_FILE_MESSAGE} Not all concept attributes are valid.`);
        });
    }
    else {
        throw new Error(`${INVALID_FILE_MESSAGE} Concept attributes are missing.`);
    }

    return { conceptObjects, conceptAttributes };
}

function tryReadLattice(
    concepts: FormalConcepts,
    jsonLattice: Array<any>,
): ConceptLattice {
    const subconceptsMapping = new Array<Set<number>>(concepts.length);
    const superconceptsMapping = new Array<Set<number>>(concepts.length);

    for (const relation of jsonLattice) {
        if (!Array.isArray(relation) || relation.length !== 2) {
            throw new Error(`${INVALID_FILE_MESSAGE} Invalid lattice relation format.`);
        }

        const sub = relation[0];
        const sup = relation[1];

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