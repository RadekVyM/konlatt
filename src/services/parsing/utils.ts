import { FORMAL_CONTEXT_CELL_SIZE } from "../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "./constants";

export function formalContextSetAttribute(context: Array<number>, cellsPerObject: number, object: number, attribute: number) {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * cellsPerObject) + Math.floor(attribute / cellSize);
    const cellValue = BigInt(context[cell]);
    const mask = 1n << BigInt(attribute % cellSize);

    context[cell] = Number(cellValue | mask);
}

export function createEmptyContext(objectsCount: number, attributesCount: number) {
    const cellsPerObjectCount = Math.ceil(attributesCount / FORMAL_CONTEXT_CELL_SIZE);
    const context = new Array<number>(objectsCount * cellsPerObjectCount);

    for (let i = 0; i < context.length; i++) {
        context[i] = 0;
    }

    return { context, cellsPerObjectCount };
}

export function readObjectsAttributesFromJson(jsonContent: { objects: any, attributes: any }) {
    let objects: Array<string>;

    if (Array.isArray(jsonContent.objects) && jsonContent.objects.length > 0) {
        objects = jsonContent.objects.map((obj: any) => {
            if (typeof obj === "string") {
                return obj;
            }
            throw new Error(`${INVALID_FILE_MESSAGE} Not all objects are strings.`);
        });
    }
    else {
        throw new Error(`${INVALID_FILE_MESSAGE} Objects are missing.`);
    }

    let attributes: Array<string>;

    if (Array.isArray(jsonContent.attributes) && jsonContent.attributes.length > 0) {
        attributes = jsonContent.attributes.map((attr: any) => {
            if (typeof attr === "string") {
                return attr;
            }
            throw new Error(`${INVALID_FILE_MESSAGE} Not all attributes are strings.`);
        });
    }
    else {
        throw new Error(`${INVALID_FILE_MESSAGE} Attributes are missing.`);
    }
    return { attributes, objects };
}

export function readObjectsAttributesFromXml(xmlContent: {
    context: {
        objects: any,
        attributes: any,
    }
}) {
    let objects: Array<string>;

    if ("obj" in xmlContent.context.objects && Array.isArray(xmlContent.context.objects.obj) && xmlContent.context.objects.obj.length > 0) {
        objects = xmlContent.context.objects.obj.map((obj: any) => {
            if (typeof obj !== "function" && typeof obj !== "object" && typeof obj !== "undefined") {
                return obj.toString();
            }
            throw new Error(`${INVALID_FILE_MESSAGE} Not all objects are valid.`);
        });
    }
    else {
        throw new Error(`${INVALID_FILE_MESSAGE} Objects are missing.`);
    }

    let attributes: Array<string>;

    if ("attr" in xmlContent.context.attributes && Array.isArray(xmlContent.context.attributes.attr) && xmlContent.context.attributes.attr.length > 0) {
        attributes = xmlContent.context.attributes.attr.map((attr: any) => {
            if (typeof attr !== "function" && typeof attr !== "object" && typeof attr !== "undefined") {
                return attr.toString();
            }
            throw new Error(`${INVALID_FILE_MESSAGE} Not all attributes are valid.`);
        });
    }
    else {
        throw new Error(`${INVALID_FILE_MESSAGE} Attributes are missing.`);
    }

    return { objects, attributes };
}