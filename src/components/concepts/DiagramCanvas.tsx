import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLattice } from "../../types/ConceptLattice";
import { FormalConcepts } from "../../types/FormalConcepts";
import { RawFormalContext } from "../../types/RawFormalContext";
import { ZoomTransform } from "../../types/d3/ZoomTransform";
import { createQuadTree, invertEventPoint } from "../../utils/d3";
import { createPoint, Point } from "../../types/Point";
import useEventListener from "../../hooks/useEventListener";
import { QuadNode } from "../../types/QuadNode";
import { Quadtree } from "d3-quadtree";

const LAYOUT_SCALE = 60;
const GRID_LINE_STEP = LAYOUT_SCALE;
const GRID_LINE_STEP_HALF = GRID_LINE_STEP / 2;
const GRID_LINE_GAP = LAYOUT_SCALE / 16;
const GRID_LINE_GAP_HALF = GRID_LINE_GAP / 2;
const GRID_LINES_INVISIBLE_THRESHOLD = 20;

export default function DiagramCanvas(props: {
    className?: string,
    ref: React.RefObject<HTMLCanvasElement | null>,
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: RawFormalContext,
    zoomTransform: ZoomTransform,
    isEditable: boolean,
    isDragZooming: boolean,
    selectedConceptIndex: number | null,
    diagramOffsets: Array<Point>,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateExtent: (width: number, height: number) => void,
    updateNodeOffset: (node: number, offset: Point) => void,
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(containerRef);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;
    const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
    const {
        draggedIndex,
        dragOffset,
        onPointerDown,
        onPointerMove,
        onClick,
    } = useCanvasInteraction(
        containerRef,
        props.layout,
        props.zoomTransform,
        width,
        height,
        props.isEditable,
        props.isDragZooming,
        props.diagramOffsets,
        setHoveredIndex,
        props.setSelectedConceptIndex,
        props.updateNodeOffset);
    const drawDiagram = useDrawDiagram(
        props.layout,
        props.diagramOffsets,
        props.lattice,
        props.concepts,
        props.formalContext,
        hoveredIndex,
        props.selectedConceptIndex,
        draggedIndex,
        dragOffset,
        dimensions.width,
        dimensions.height);
    const drawGrid = useDrawGrid();

    useEffect(() => {
        const canvas = props.ref.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) {
            return;
        }

        context.clearRect(0, 0, width, height);

        const scale = props.zoomTransform.scale * window.devicePixelRatio;
        const w = width / window.devicePixelRatio;
        const h = height / window.devicePixelRatio;
        const computedStyle = getComputedStyle(canvas);

        context.save();
        context.translate(props.zoomTransform.x * window.devicePixelRatio, props.zoomTransform.y * window.devicePixelRatio);
        context.scale(scale, scale);
        if (props.isEditable) {
            drawGrid(context, w, h, props.zoomTransform.x, props.zoomTransform.y, props.zoomTransform.scale, computedStyle);
        }
        drawDiagram(context, computedStyle);
        context.restore();
    }, [width, height, props.zoomTransform.scale, props.zoomTransform.x, props.zoomTransform.y, props.isEditable, drawDiagram, drawGrid]);

    useEffect(() => {
        props.updateExtent(dimensions.width, dimensions.height);
    }, [dimensions.width, dimensions.height]);

    return (
        <div
            ref={containerRef}
            className={props.className}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onClick={onClick}>
            <canvas
                ref={props.ref}
                className="w-full h-full"
                width={width}
                height={height} />
        </div>
    );
}

function useQuadTree(layout: ConceptLatticeLayout, diagramOffsets: Array<Point>) {
    const quadTreeRef = useRef<Quadtree<QuadNode>>(null);

    useEffect(() => {
        quadTreeRef.current = createQuadTree(layout, diagramOffsets);
    }, [layout, diagramOffsets]);

    return {
        quadTreeRef
    };
}

function useCanvasInteraction(
    containerRef: React.RefObject<HTMLDivElement | null>,
    layout: ConceptLatticeLayout,
    zoomTransform: ZoomTransform,
    width: number,
    height: number,
    isEditable: boolean,
    isDragZooming: boolean,
    diagramOffsets: Array<Point>,
    setHoveredIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateNodeOffset: (node: number, offset: Point) => void,
) {
    const dragStartPointRef = useRef<[number, number]>([0, 0]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
    const { quadTreeRef } = useQuadTree(layout, diagramOffsets);
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
        setDraggedIndex(node ? node.index : null);

        dragStartPointRef.current = getPoint(e.clientX, e.clientY);
    }

    function onPointerMove(e: React.PointerEvent<HTMLElement>) {
        if (!isDragging && !isDragZooming) {
            const node = findNode(e);
            setHoveredIndex(node ? node.index : null);
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

        setSelectedIndex((old) => old === node?.index ?
            null :
            node ? node.index : null);
    }

    function findNode(e: React.PointerEvent<HTMLElement>) {
        const point = getPoint(e.clientX, e.clientY);
        return quadTreeRef.current?.find(point[0], point[1], 6 / LAYOUT_SCALE);
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

function useDrawGrid() {
    const drawGrid = useCallback((
        context: CanvasRenderingContext2D,
        width: number,
        height: number,
        translateX: number,
        translateY: number,
        scale: number,
        computedStyle: CSSStyleDeclaration
    ) => {
        const outlineColor = computedStyle.getPropertyValue("--outline-variant");
        const centerX = width / 2;
        const centerY = height / 2;

        const left = -translateX / scale;
        const top = -translateY / scale;
        const right = left + (width / scale);
        const bottom = top + (height / scale);
        const startX = left + ((centerX - left) % GRID_LINE_STEP);
        const startY = top + ((centerY - top) % GRID_LINE_STEP);

        if (GRID_LINE_STEP_HALF * scale > GRID_LINES_INVISIBLE_THRESHOLD) {
            context.beginPath();
            for (let x = startX - GRID_LINE_STEP_HALF; x < right; x += GRID_LINE_STEP) {
                context.moveTo(x, startY - GRID_LINE_STEP + GRID_LINE_GAP_HALF);
                context.lineTo(x, bottom);
            }
            for (let y = startY - GRID_LINE_STEP_HALF; y < bottom; y += GRID_LINE_STEP) {
                context.moveTo(startX - GRID_LINE_STEP + GRID_LINE_GAP_HALF, y);
                context.lineTo(right, y);
            }
            context.strokeStyle = outlineColor;
            context.setLineDash([GRID_LINE_GAP, GRID_LINE_GAP]);
            context.stroke();
        }

        context.beginPath();
        for (let x = startX - GRID_LINE_STEP; x < right; x += GRID_LINE_STEP) {
            context.moveTo(x, top);
            context.lineTo(x, bottom);
        }
        for (let y = startY - GRID_LINE_STEP; y < bottom; y += GRID_LINE_STEP) {
            context.moveTo(left, y);
            context.lineTo(right, y);
        }
        context.strokeStyle = outlineColor;
        context.setLineDash([]);
        context.stroke();
    }, []);

    return drawGrid;
}

function useDrawDiagram(
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: RawFormalContext,
    hoveredIndex: number | null,
    selectedIndex: number | null,
    draggedIndex: number | null,
    dragOffset: [number, number],
    width: number,
    height: number,
) {
    const targetPoints = useMemo(() => {
        const centerX = width / 2;
        const centerY = height / 2;

        return concepts.map((concept) => {
            const point = layout[concept.index];
            const offset = diagramOffsets[concept.index];
            const isDragged = draggedIndex === concept.index;

            const x = ((point[0] + offset[0] + (isDragged ? dragOffset[0] : 0)) * LAYOUT_SCALE) + centerX;
            const y = ((point[1] + offset[1] + (isDragged ? dragOffset[1] : 0)) * LAYOUT_SCALE) + centerY;
            return [x, y];
        });
    }, [concepts, width, height, layout, diagramOffsets, draggedIndex, dragOffset]);

    const drawDiagram = useCallback((context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration) => {
        const onSurfaceColor = computedStyle.getPropertyValue("--on-surface-container");
        const primaryColor = computedStyle.getPropertyValue("--primary");
        const outlineColor = computedStyle.getPropertyValue("--outline");

        context.strokeStyle = outlineColor;

        for (const concept of concepts) {
            const subconcepts = lattice.subconceptsMapping[concept.index];
            const [startX, startY] = targetPoints[concept.index];

            for (const subconceptIndex of subconcepts) {
                // TODO: endPoint is sometimes undefined when drawing nom10shuttle
                const [endX, endY] = targetPoints[subconceptIndex];
                
                context.beginPath();
                context.moveTo(startX, startY);
                context.lineTo(endX, endY);
                context.stroke();
            }
        }

        context.fillStyle = onSurfaceColor;

        for (const concept of concepts) {
            if (concept.index === selectedIndex || concept.index === hoveredIndex) {
                continue;
            }

            const [x, y] = targetPoints[concept.index];

            context.beginPath();
            context.moveTo(x, y);
            context.arc(x, y, 5, 0, 2 * Math.PI);
            context.fill();
        }

        if (hoveredIndex !== null) {
            const [x, y] = targetPoints[hoveredIndex];

            context.beginPath();
            context.fillStyle = primaryColor;
            context.arc(x, y, 5, 0, 2 * Math.PI);
            context.fill();
        }

        if (selectedIndex !== null && selectedIndex !== hoveredIndex) {
            const [x, y] = targetPoints[selectedIndex];

            context.beginPath();
            context.arc(x, y, 5, 0, 2 * Math.PI);
            context.fillStyle = primaryColor;
            context.fill();
        }

        context.font = "6px Gabarito";
        context.fillStyle = onSurfaceColor;

        for (const concept of concepts) {
            const [x, y] = targetPoints[concept.index];

            const objectLabels = lattice.objectsLabeling.get(concept.index);
            const attributeLabels = lattice.attributesLabeling.get(concept.index);

            if (objectLabels) {
                context.textAlign = "center";
                context.textBaseline = "hanging";
                const label = objectLabels.map((l) => formalContext.objects[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y + 7);
            }

            if (attributeLabels) {
                context.textAlign = "center";
                context.textBaseline = "alphabetic";
                const label = attributeLabels.map((l) => formalContext.attributes[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y - 7);
            }
        }
    }, [lattice, concepts, formalContext, hoveredIndex, selectedIndex, targetPoints]);

    return drawDiagram;
}

function toLayoutCoord(coord: number, size: number) {
    return (coord - ((size/ window.devicePixelRatio) / 2)) / LAYOUT_SCALE;
}

// @ts-expect-error
function getVisibleRect(zoomTransform: ZoomTransform, canvasWidth: number, canvasHeight: number): { x: number, y: number, width: number, height: number } {
    const left = -zoomTransform.x / LAYOUT_SCALE;
    const top = -zoomTransform.y / LAYOUT_SCALE;
    const width = (canvasWidth / zoomTransform.scale) / LAYOUT_SCALE;
    const height = (canvasHeight / zoomTransform.scale) / LAYOUT_SCALE;
    
    return {
        x: left - (width / 2),
        y: top - (height / 2),
        width,
        height,
    };
}