import { Point } from "./Point";

export type NodeOffsetMemento = Array<{
    node: number,
    offset: Point,
}>

export function createNodeOffsetMemento(node: number, offset: Point): NodeOffsetMemento {
    return [{
        node,
        offset,
    }];
}