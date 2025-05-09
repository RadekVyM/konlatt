import { useEffect, useMemo, useRef, useState } from "react";
import useDiagramStore from "../../../../stores/useDiagramStore";
import { ZoomTransform } from "../../../../types/d3/ZoomTransform";
import { createPoint, Point } from "../../../../types/Point";
import { Quadtree } from "d3-quadtree";
import { QuadNode } from "../../../../types/QuadNode";
import { createQuadTree, invertEventPoint } from "../../../../utils/d3";
import { LAYOUT_SCALE, NODE_RADIUS_INTERACTION } from "../../../../constants/diagram";
import useEventListener from "../../../../hooks/useEventListener";
import { Rect } from "../../../../types/Rect";
import { isInRect } from "../../../../utils/rect";

export default function useCanvasInteraction(
    containerRef: React.RefObject<HTMLDivElement | null>,
    zoomTransform: ZoomTransform,
    width: number,
    height: number,
    isEditable: boolean,
    isDragZooming: boolean,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateNodeOffsets: (nodes: Iterable<number>, offset: Point) => void,
) {
    const setSelectedIndex = useDiagramStore((state) => state.setSelectedConceptIndex);
    const dragStartPointRef = useRef<[number, number]>([0, 0]);
    const isDraggingRef = useRef<boolean>(false);
    const isSelectingRef = useRef<boolean>(false);
    const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
    const [dragSelectionRect, setDragSelectionRect] = useState<Rect | null>(null);
    const [draggedNodes, setDraggedNodes] = useState<Array<number>>([]);
    const { quadTreeRef } = useQuadTree();
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const conceptToLayoutIndexesMapping = useDiagramStore((state) => state.conceptToLayoutIndexesMapping);

    const { draggedConceptIndexes, draggedConceptsRect } = useMemo(() => {
        const draggedConceptIndexes = new Set<number>();
        const nodeRaius = NODE_RADIUS_INTERACTION / LAYOUT_SCALE;
        const nodeSize = nodeRaius * 2;
        let left = Number.MAX_SAFE_INTEGER;
        let right = Number.MIN_SAFE_INTEGER;
        let top = Number.MAX_SAFE_INTEGER;
        let bottom = Number.MIN_SAFE_INTEGER;

        if (diagramOffsets && layout) {
            for (const conceptIndex of draggedNodes) {
                const index = conceptToLayoutIndexesMapping.get(conceptIndex);

                if (index === undefined) {
                    continue;
                }

                const point = layout[index];
                const offset = diagramOffsets[index];
                const x = point.x + offset[0];
                const y = point.y + offset[1];

                left = Math.min(left, x);
                right = Math.max(right, x);
                top = Math.min(top, y);
                bottom = Math.max(bottom, y);

                draggedConceptIndexes.add(conceptIndex);
            }
        }

        return {
            draggedConceptIndexes,
            draggedConceptsRect: draggedNodes.length > 0 ?
                {
                    x: left - nodeRaius,
                    y: top - nodeRaius,
                    width: right - left + nodeSize,
                    height: bottom - top + nodeSize,
                } :
                null
        };
    }, [draggedNodes, layout, diagramOffsets, conceptToLayoutIndexesMapping]);

    useEffect(() => {
        if (!isEditable) {
            setDraggedNodes([]);
        }
    }, [isEditable]);

    useEffect(() => {
        if (isEditable) {
            setDraggedNodes([]);
        }
    }, [isEditable, layout]);

    // This is super important to make node dragging work on touch screens
    useEventListener("touchmove", (e) => {
        if (isDraggingRef.current || isSelectingRef.current) {
            e.preventDefault();
        }
    }, containerRef, { passive: false });

    useEventListener("pointerup", () => {
        if (isDraggingRef.current) {
            updateNodeOffsets(draggedConceptIndexes, createPoint(dragOffset[0], dragOffset[1], 0));
            setDragOffset([0, 0]);
            isDraggingRef.current = false;
            dragStartPointRef.current = [0, 0];
        }

        if (isSelectingRef.current) {
            setDragSelectionRect(null);
            isSelectingRef.current = false;
        }
    });

    useEventListener("pointermove", (e) => {
        if (isDraggingRef.current) {
            const [offsetX, offsetY] = getPoint(e.clientX, e.clientY);
            const start = dragStartPointRef.current;
            setDragOffset([offsetX - start[0], offsetY - start[1]]);
        }

        if (isSelectingRef.current) {
            const [offsetX, offsetY] = getPoint(e.clientX, e.clientY);
            const rect: Rect = {
                x: Math.min(offsetX, dragStartPointRef.current[0]),
                y: Math.min(offsetY, dragStartPointRef.current[1]),
                width: Math.abs(dragStartPointRef.current[0] - offsetX),
                height: Math.abs(dragStartPointRef.current[1] - offsetY),
            };
            const draggedNodes = new Array<number>();

            for (const node of quadTreeRef.current?.data() || []) {
                if (isInRect(node.x, node.y, rect)) {
                    draggedNodes.push(node.conceptIndex);
                }
            }

            setDragSelectionRect(rect);
            setDraggedNodes(draggedNodes);
        }
    });

    function onPointerDown(e: React.PointerEvent<HTMLElement>) {
        if (!isEditable) {
            return;
        }
        const node = findNode(e);
        const point = getPoint(e.clientX, e.clientY);

        if (!isDraggingRef.current &&
            !isSelectingRef.current &&
            draggedConceptsRect &&
            isInRect(point[0], point[1], draggedConceptsRect)) {
            isDraggingRef.current = true;
        }
        else if (node) {
            isDraggingRef.current = true;
            setDraggedNodes(node ? [node.conceptIndex] : []);
        }
        else {
            isSelectingRef.current = true;
            setDragSelectionRect(null);
        }

        dragStartPointRef.current = point;
    }

    function onPointerMove(e: React.PointerEvent<HTMLElement>) {
        if (!isSelectingRef.current && !isDraggingRef.current && !isDragZooming) {
            const node = findNode(e);
            setHoveredIndex(node ? node.conceptIndex : null);
        }
    }

    function onClick(e: React.PointerEvent<HTMLDivElement>) {
        if (isEditable) {
            return;
        }

        const node = findNode(e);

        if (!node) {
            return;
        }

        setSelectedIndex((old) => old === node?.conceptIndex ?
            null :
            node ? node.conceptIndex : null);
    }

    function findNode(e: React.PointerEvent<HTMLElement>) {
        const point = getPoint(e.clientX, e.clientY);
        return quadTreeRef.current?.find(point[0], point[1], NODE_RADIUS_INTERACTION / LAYOUT_SCALE);
    }

    function getPoint(pointerX: number, pointerY: number): [number, number] {
        const rect = containerRef.current?.getBoundingClientRect();
        const point = invertEventPoint([pointerX - (rect?.left || 0), pointerY - (rect?.top || 0)], zoomTransform);
        return [toLayoutCoord(point[0], width), toLayoutCoord(point[1], height)];
    }

    return {
        dragOffset,
        dragSelectionRect,
        draggedConceptIndexes,
        draggedConceptsRect,
        onPointerDown,
        onPointerMove,
        onClick,
    };
}

function useQuadTree() {
    const quadTreeRef = useRef<Quadtree<QuadNode>>(null);
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);

    useEffect(() => {
        if (!layout || !diagramOffsets) {
            return;
        }

        quadTreeRef.current = createQuadTree(layout, diagramOffsets);
    }, [layout, diagramOffsets]);

    return {
        quadTreeRef
    };
}

function toLayoutCoord(coord: number, size: number) {
    return (coord - ((size / window.devicePixelRatio) / 2)) / LAYOUT_SCALE;
}