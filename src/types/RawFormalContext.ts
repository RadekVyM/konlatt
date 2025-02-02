const FORMAL_CONTEXT_CELL_SIZE: number = 64;

export type RawFormalContext = {
    context: Array<bigint>,
    objects: Array<string>,
    attributes: Array<string>,
    cellsPerObject: number,
    cellSize: number
}

export function formalContextHasAttribute(context: RawFormalContext, object: number, attribute: number): boolean {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * context.cellsPerObject) + Math.floor(attribute / cellSize);
    const cellValue: bigint = context.context[cell];
    const mask: bigint = 1n << BigInt(attribute % cellSize);

    return (cellValue & mask) !== 0n;
}