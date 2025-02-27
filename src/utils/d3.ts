
import * as d3Zoom from "d3-zoom";
import * as d3Quadtree from "d3-quadtree";
import * as d3Selection from "d3-selection";
import { ZoomTransform } from "../types/d3/ZoomTransform";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { QuadNode } from "../types/QuadNode";
import { Point } from "../types/Point";

export function invertEventPoint(event: React.PointerEvent<HTMLElement>, zoomTransform: ZoomTransform) {
    return invertPoint(d3Selection.pointer(event), zoomTransform);
}

export function invertPoint(point: [number, number], zoomTransform: ZoomTransform) {
    const t = d3Zoom.zoomIdentity
        .translate(zoomTransform.x, zoomTransform.y)
        .scale(zoomTransform.scale);

    return t.invert(point);
}

export function createQuadTree(layout: ConceptLatticeLayout, diagramOffsets: Array<Point>) {
    return d3Quadtree
        .quadtree<QuadNode>()
        .x((n) => n.x)
        .y((n) => n.y)
        .addAll(layout.map((point, index) => {
            const offset = diagramOffsets[index];
            return { x: point[0] + offset[0], y: point[1] + offset[1], index };
        }));
}