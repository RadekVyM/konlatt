export const FORMAL_CONTEXT_CELL_SIZE: number = 32;

export type FormalContext = {
    readonly context: ReadonlyArray<number>,
    readonly objects: ReadonlyArray<string>,
    readonly attributes: ReadonlyArray<string>,
    readonly cellsPerObject: number,
    readonly cellSize: number
}

export function formalContextHasAttribute(context: FormalContext, object: number, attribute: number): boolean {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * context.cellsPerObject) + Math.floor(attribute / cellSize);
    const cellValue: number = context.context[cell];
    const mask: number = 1 << attribute % cellSize;

    return (cellValue & mask) !== 0;
}

export function getObjectAttributes(context: FormalContext, object: number): Array<number> {
    const attributes = new Array<number>();

    for (let attribute = 0; attribute < context.attributes.length; attribute++) {
        if (formalContextHasAttribute(context, object, attribute)) {
            attributes.push(attribute);
        }
    }

    return attributes;
}

export function getAttributeObjects(context: FormalContext, attribute: number): Array<number> {
    const objects = new Array<number>();

    for (let object = 0; object < context.objects.length; object++) {
        if (formalContextHasAttribute(context, object, attribute)) {
            objects.push(object);
        }
    }

    return objects;
}