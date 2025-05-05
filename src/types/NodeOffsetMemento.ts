import { Point } from "./Point";

export type NodeOffsetMemento = Array<{
    nodes: Array<number>,
    offset: Point,
}>

export function createNodeOffsetMemento(nodes: Array<number>, offset: Point): NodeOffsetMemento {
    return [{
        nodes,
        offset,
    }];
}