import { Point } from "../Point";

export type NodeOffsetMemento = {
    nodes: ReadonlyArray<number>,
    offset: Point,
}

export function createNodeOffsetMemento(nodes: ReadonlyArray<number>, offset: Point): NodeOffsetMemento {
    return {
        nodes,
        offset,
    };
}