export const FORMAL_CONTEXT_CELL_SIZE: number = 32;

export type FormalContext = {
    readonly name?: string,
    readonly relation: ReadonlyArray<number>,
    readonly cellsPerObject: number,
    readonly cellSize: number,
    readonly objects: ReadonlyArray<string>,
    readonly attributes: ReadonlyArray<string>,
}

export function formalContextHasAttribute(context: FormalContext, object: number, attribute: number): boolean {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * context.cellsPerObject) + Math.floor(attribute / cellSize);
    const cellValue: number = context.relation[cell];
    const mask: number = 1 << attribute % cellSize;

    return (cellValue & mask) !== 0;
}

export function getObjectAttributes(context: FormalContext, objects: number | ReadonlyArray<number>): Array<number> {
    const attributes = new Array<number>();
    const objectsArray = typeof objects === "number" ? [objects] : objects;

    for (let attribute = 0; attribute < context.attributes.length; attribute++) {
        if (objectsArray.every((object) => formalContextHasAttribute(context, object, attribute))) {
            attributes.push(attribute);
        }
    }

    return attributes;
}

export function getAttributeObjects(context: FormalContext, attributes: number | ReadonlyArray<number>): Array<number> {
    const objects = new Array<number>();
    const attributesArray = typeof attributes === "number" ? [attributes] : attributes;

    for (let object = 0; object < context.objects.length; object++) {
        if (attributesArray.every((attribute) => formalContextHasAttribute(context, object, attribute))) {
            objects.push(object);
        }
    }

    return objects;
}