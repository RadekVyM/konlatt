export const FORMAL_CONTEXT_CELL_SIZE: i32 = 32;

export class FormalContext {
    context: StaticArray<u32> = [];
    objects: StaticArray<string> = [];
    attributes: StaticArray<string> = [];
    cellsPerObject: i32 = 0;
    cellSize: i32 = FORMAL_CONTEXT_CELL_SIZE;
}

export function formalContextHasAttribute(context: FormalContext, object: i32, attribute: i32): boolean {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * context.cellsPerObject) + (attribute / cellSize);
    const cellValue: u32 = context.context[cell];
    const mask: u32 = 1 << (attribute % cellSize);

    return (cellValue & mask) !== 0;
}

export function hasObjectWithAllAttributes(context: FormalContext): boolean {
    for (let o = 0; o < context.objects.length; o++) {
        let has = true;

        for (let a = 0; a < context.attributes.length; a++) {
            if (!formalContextHasAttribute(context, o, a)) {
                has = false;
                break;
            }
        }

        if (has) {
            return true;
        }
    }

    return false;
}