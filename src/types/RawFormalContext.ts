const FORMAL_CONTEXT_CELL_SIZE: number = 64;

export type RawFormalContext = {
    readonly context: ReadonlyArray<number>,
    readonly objects: ReadonlyArray<string>,
    readonly attributes: ReadonlyArray<string>,
    readonly cellsPerObject: number,
    readonly cellSize: number
}

export function formalContextHasAttribute(context: RawFormalContext, object: number, attribute: number): boolean {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * context.cellsPerObject) + Math.floor(attribute / cellSize);
    const cellValue: number = context.context[cell];
    const mask: number = 1 << attribute % cellSize;

    return (cellValue & mask) !== 0;
}