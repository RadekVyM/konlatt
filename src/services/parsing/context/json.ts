import { FORMAL_CONTEXT_CELL_SIZE, FormalContext } from "../../../types/FormalContext";
import { INVALID_FILE_MESSAGE } from "../constants";
import { formalContextSetAttribute } from "../utils";

export default function parseJsonContext(jsonContent: {
    objects: any,
    attributes: any,
    relations: any,
}): FormalContext {
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

    const cellsPerObjectCount = Math.ceil(attributes.length / FORMAL_CONTEXT_CELL_SIZE);
    const context = new Array<number>(objects.length * cellsPerObjectCount);

    for (let i = 0; i < context.length; i++) {
        context[i] = 0;
    }

    if (Array.isArray(jsonContent.relations)) {
        for (const relation of jsonContent.relations) {
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
        context,
        objects,
        attributes,
        cellsPerObject: cellsPerObjectCount,
        cellSize: FORMAL_CONTEXT_CELL_SIZE,
    };
}