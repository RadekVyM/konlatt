import { Point } from "./Point";

export type NodeOffsetMemento = {
    nodes: Array<number>,
    offset: Point,
}

export function createNodeOffsetMemento(nodes: Array<number>, offset: Point): NodeOffsetMemento {
    return {
        nodes,
        offset,
    };
}