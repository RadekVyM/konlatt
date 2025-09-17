import { FORMAL_CONTEXT_CELL_SIZE } from "../../types/FormalContext";

export function formalContextSetAttribute(context: Array<number>, cellsPerObject: number, object: number, attribute: number) {
    const cellSize = FORMAL_CONTEXT_CELL_SIZE;
    const cell = (object * cellsPerObject) + Math.floor(attribute / cellSize);
    const cellValue: number = context[cell];
    const mask: number = 1 << attribute % cellSize;

    context[cell] = cellValue | mask;
}