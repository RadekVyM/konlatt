import * as d3Zoom from "d3-zoom";
import * as d3Quadtree from "d3-quadtree";
import { ZoomTransform } from "../types/d3/ZoomTransform";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { QuadNode } from "../types/QuadNode";
import { Point } from "../types/Point";

export function invertEventPoint(point: [number, number], zoomTransform: ZoomTransform) {
    return invertPoint(point, zoomTransform);
}

export function invertPoint(point: [number, number], zoomTransform: ZoomTransform) {
    const t = d3Zoom.zoomIdentity
        .translate(zoomTransform.x, zoomTransform.y)
        .scale(zoomTransform.scale);

    return t.invert(point);
}

export function createQuadTree(
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    visibleConceptIndexes: Set<number> | null,
) {
    const nodes = new Array<QuadNode>();

    for (let i = 0; i < layout.length; i++) {
        if (!visibleConceptIndexes || visibleConceptIndexes.has(i)) {
            const point = layout[i];
            const offset = diagramOffsets[i];
            nodes.push({ x: point[0] + offset[0], y: point[1] + offset[1], index: i });
        }
    }

    return d3Quadtree
        .quadtree<QuadNode>()
        .x((n) => n.x)
        .y((n) => n.y)
        .addAll(nodes);
}