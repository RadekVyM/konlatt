import { useEffect, useRef, useState } from "react";
import useDiagramStore from "../../../../stores/useDiagramStore";
import { ZoomTransform } from "../../../../types/d3/ZoomTransform";
import { createPoint, Point } from "../../../../types/Point";
import { Quadtree } from "d3-quadtree";
import { QuadNode } from "../../../../types/QuadNode";
import { createQuadTree, invertEventPoint } from "../../../../utils/d3";
import { LAYOUT_SCALE, NODE_RADIUS_INTERACTION } from "../../../../constants/diagram";
import useEventListener from "../../../../hooks/useEventListener";

export default function useCanvasInteraction(
    containerRef: React.RefObject<HTMLDivElement | null>,
    zoomTransform: ZoomTransform,
    width: number,
    height: number,
    isEditable: boolean,
    isDragZooming: boolean,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateNodeOffset: (node: number, offset: Point) => void,
) {
    const setSelectedIndex = useDiagramStore((state) => state.setSelectedConceptIndex);
    const dragStartPointRef = useRef<[number, number]>([0, 0]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
    const { quadTreeRef } = useQuadTree();
    const isDragging = draggedIndex !== null;

    // This is super important to make node dragging work on touch screens
    useEventListener("touchmove", (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    }, containerRef, { passive: false });

    useEventListener("pointerup", () => {
        if (isDragging) {
            updateNodeOffset(draggedIndex, createPoint(dragOffset[0], dragOffset[1], 0));
            setDraggedIndex(null);
            setDragOffset([0, 0]);
            dragStartPointRef.current = [0, 0];
        }
    });

    useEventListener("pointermove", (e) => {
        if (isDragging) {
            const [offsetX, offsetY] = getPoint(e.clientX, e.clientY);
            const start = dragStartPointRef.current;
            setDragOffset([offsetX - start[0], offsetY - start[1]]);
        }
    });

    function onPointerDown(e: React.PointerEvent<HTMLElement>) {
        if (!isEditable) {
            return;
        }
        const node = findNode(e);
        setDraggedIndex(node ? node.conceptIndex : null);

        dragStartPointRef.current = getPoint(e.clientX, e.clientY);
    }

    function onPointerMove(e: React.PointerEvent<HTMLElement>) {
        if (!isDragging && !isDragZooming) {
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
        draggedIndex,
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