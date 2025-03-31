import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useDimensions from "../../hooks/useDimensions";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ConceptLattice } from "../../types/ConceptLattice";
import { FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { ZoomTransform } from "../../types/d3/ZoomTransform";
import { createQuadTree, invertEventPoint } from "../../utils/d3";
import { createPoint, Point } from "../../types/Point";
import useEventListener from "../../hooks/useEventListener";
import { QuadNode } from "../../types/QuadNode";
import { Quadtree } from "d3-quadtree";
import { Rect } from "../../types/Rect";
import { crossesRect, isInRect } from "../../utils/rect";
import { cn } from "../../utils/tailwind";

const LAYOUT_SCALE = 60;
const GRID_LINE_STEP = LAYOUT_SCALE;
const GRID_LINE_STEP_HALF = GRID_LINE_STEP / 2;
const GRID_LINE_GAP = LAYOUT_SCALE / 16;
const GRID_LINE_GAP_HALF = GRID_LINE_GAP / 2;
const GRID_LINES_INVISIBLE_THRESHOLD = 20;
const NODE_RADIUS = 5;
const NODE_RADIUS_INTERACTION = NODE_RADIUS + 1;

export default function DiagramCanvas(props: {
    className?: string,
    ref: React.RefObject<HTMLDivElement | null>,
    layout: ConceptLatticeLayout,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: FormalContext,
    zoomTransform: ZoomTransform,
    isEditable: boolean,
    isDragZooming: boolean,
    selectedConceptIndex: number | null,
    diagramOffsets: Array<Point>,
    visibleConceptIndexes: Set<number> | null,
    setSelectedConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    updateExtent: (width: number, height: number) => void,
    updateNodeOffset: (node: number, offset: Point) => void,
}) {
    const gridCanvasRef = useRef<HTMLCanvasElement>(null);
    const linksCanvasRef = useRef<HTMLCanvasElement>(null);
    const nodesCanvasRef = useRef<HTMLCanvasElement>(null);
    const dimensions = useDimensions(props.ref);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;
    const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
    const visibleRect = useMemo(() => getVisibleRect(props.zoomTransform, dimensions.width, dimensions.height), [props.zoomTransform, dimensions.width, dimensions.height]);
    const {
        draggedIndex,
        dragOffset,
        onPointerDown,
        onPointerMove,
        onClick,
    } = useCanvasInteraction(
        props.ref,
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
    const {
        drawNodes,
        drawLinks,
    } = useDrawDiagram(
        props.layout,
        props.diagramOffsets,
        props.lattice,
        props.concepts,
        props.formalContext,
        props.visibleConceptIndexes,
        hoveredIndex,
        props.selectedConceptIndex,
        draggedIndex,
        dragOffset,
        dimensions.width,
        dimensions.height,
        visibleRect,
        props.zoomTransform.scale);
    const drawGrid = useDrawGrid(
        dimensions.width,
        dimensions.height,
        props.zoomTransform.x,
        props.zoomTransform.y,
        props.zoomTransform.scale);

    useEffect(() => {
        drawOnCanvas(
            gridCanvasRef.current,
            props.isEditable,
            props.zoomTransform.x,
            props.zoomTransform.y,
            drawGrid
        );
    }, [props.zoomTransform.x, props.zoomTransform.y, props.isEditable, drawGrid]);

    useEffect(() => {
        drawOnCanvas(
            linksCanvasRef.current,
            true,
            props.zoomTransform.x,
            props.zoomTransform.y,
            drawLinks
        );
    }, [props.zoomTransform.x, props.zoomTransform.y, drawLinks]);

    useEffect(() => {
        drawOnCanvas(
            nodesCanvasRef.current,
            true,
            props.zoomTransform.x,
            props.zoomTransform.y,
            drawNodes
        );
    }, [props.zoomTransform.x, props.zoomTransform.y, props.isEditable, drawNodes]);

    useEffect(() => {
        props.updateExtent(dimensions.width, dimensions.height);
    }, [dimensions.width, dimensions.height]);

    return (
        <div
            ref={props.ref}
            className={cn("relative", props.className)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onClick={onClick}>
            <canvas
                ref={gridCanvasRef}
                className="absolute inset-0 w-full h-full"
                width={width}
                height={height} />
            <canvas
                ref={linksCanvasRef}
                className="absolute inset-0 w-full h-full"
                width={width}
                height={height} />
            <canvas
                ref={nodesCanvasRef}
                className="absolute inset-0 w-full h-full"
                width={width}
                height={height} />
        </div>
    );
}

function useQuadTree(
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
) {
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

function useDrawGrid(
    width: number,
    height: number,
    translateX: number,
    translateY: number,
    scale: number,
) {
    const drawGrid = useCallback((
        context: CanvasRenderingContext2D,
        computedStyle: CSSStyleDeclaration,
    ) => {
        const outlineColor = computedStyle.getPropertyValue("--outline-variant");
        const deviceWidth = width * window.devicePixelRatio;
        const deviceHeight = height * window.devicePixelRatio;
        const centerX = deviceWidth / 2;
        const centerY = deviceHeight / 2;
        const deviceScale = scale * window.devicePixelRatio;
        const gridLineStep = GRID_LINE_STEP * deviceScale;
        const gridLineStepHalf = GRID_LINE_STEP_HALF * deviceScale;
        const gridLineGap = GRID_LINE_GAP * deviceScale;
        const gridLineGapHalf = GRID_LINE_GAP_HALF * deviceScale;

        const left = -translateX * window.devicePixelRatio;
        const top = -translateY * window.devicePixelRatio;
        const right = left + (deviceWidth);
        const bottom = top + (deviceHeight);
        const startX = left + ((centerX * scale - left) % gridLineStep);
        const startY = top + ((centerY * scale - top) % gridLineStep);

        context.lineWidth = 1.5 * window.devicePixelRatio;

        if (gridLineStepHalf > GRID_LINES_INVISIBLE_THRESHOLD) {
            context.beginPath();
            for (let x = startX - gridLineStepHalf; x < right; x += gridLineStep) {
                context.moveTo(x, startY - gridLineStep + gridLineGapHalf);
                context.lineTo(x, bottom);
            }
            for (let y = startY - gridLineStepHalf; y < bottom; y += gridLineStep) {
                context.moveTo(startX - gridLineStep + gridLineGapHalf, y);
                context.lineTo(right, y);
            }
            context.strokeStyle = outlineColor;
            context.setLineDash([gridLineGap, gridLineGap]);
            context.stroke();
        }

        context.beginPath();
        for (let x = startX - gridLineStep; x < right; x += gridLineStep) {
            context.moveTo(x, top);
            context.lineTo(x, bottom);
        }
        for (let y = startY - gridLineStep; y < bottom; y += gridLineStep) {
            context.moveTo(left, y);
            context.lineTo(right, y);
        }
        context.strokeStyle = outlineColor;
        context.setLineDash([]);
        context.stroke();
    }, [width, height, translateX, translateY, scale]);

    return drawGrid;
}

function useDrawDiagram(
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    lattice: ConceptLattice,
    concepts: FormalConcepts,
    formalContext: FormalContext,
    visibleConceptIndexes: Set<number> | null,
    hoveredIndex: number | null,
    selectedIndex: number | null,
    draggedIndex: number | null,
    dragOffset: [number, number],
    width: number,
    height: number,
    visibleRect: Rect,
    scale: number,
) {
    const deviceScale = scale * window.devicePixelRatio;

    const targetPoints = useMemo(() => {
        const centerX = (width / 2) * deviceScale;
        const centerY = (height / 2) * deviceScale;

        return concepts.map((concept) => {
            const point = layout[concept.index];
            const offset = diagramOffsets[concept.index];
            const isDragged = draggedIndex === concept.index;

            const normalX = point[0] + offset[0] + (isDragged ? dragOffset[0] : 0);
            const normalY = point[1] + offset[1] + (isDragged ? dragOffset[1] : 0);
            const x = (normalX * LAYOUT_SCALE * deviceScale) + centerX;
            const y = (normalY * LAYOUT_SCALE * deviceScale) + centerY;
            return [x, y, normalX, normalY];
        });
    }, [concepts, width, height, layout, diagramOffsets, draggedIndex, dragOffset, deviceScale]);

    const drawNodes = useCallback((context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration) => {
        const onSurfaceColor = computedStyle.getPropertyValue("--on-surface-container");
        const primaryColor = computedStyle.getPropertyValue("--primary");

        const baseNodeRadius = NODE_RADIUS * deviceScale;
        const nodeCanvas = createNodeCanvas(baseNodeRadius, onSurfaceColor);
        const invisibleNodeCanvas = createNodeCanvas(baseNodeRadius / 2, onSurfaceColor);

        for (const concept of concepts) {
            if (concept.index === selectedIndex || concept.index === hoveredIndex) {
                continue;
            }

            const [x, y, normalX, normalY] = targetPoints[concept.index];

            if (!isInRect(normalX, normalY, visibleRect)) {
                continue;
            }

            const canvas = !visibleConceptIndexes || visibleConceptIndexes.has(concept.index) ?
                nodeCanvas :
                invisibleNodeCanvas; 

            // It should be faster if I round the coordinates here, but the nodes become choppy, which does not look good
            context.drawImage(canvas, x - (canvas.width / 2), y - (canvas.height / 2));
        }

        if (hoveredIndex !== null) {
            const [x, y] = targetPoints[hoveredIndex];

            context.beginPath();
            context.fillStyle = primaryColor;
            context.arc(x, y, NODE_RADIUS * deviceScale, 0, 2 * Math.PI);
            context.fill();
        }

        if (selectedIndex !== null && selectedIndex !== hoveredIndex) {
            const [x, y] = targetPoints[selectedIndex];

            context.beginPath();
            context.arc(x, y, NODE_RADIUS * deviceScale, 0, 2 * Math.PI);
            context.fillStyle = primaryColor;
            context.fill();
        }

        const fontSize = 6 * deviceScale;

        if (fontSize < 1) {
            return;
        }

        context.font = `${fontSize}px Gabarito`;
        context.fillStyle = onSurfaceColor;

        for (const concept of concepts) {
            const [x, y, normalX, normalY] = targetPoints[concept.index];

            if (!isInRect(normalX, normalY, visibleRect)) {
                continue;
            }

            const objectLabels = lattice.objectsLabeling.get(concept.index);
            const attributeLabels = lattice.attributesLabeling.get(concept.index);

            if (objectLabels) {
                context.textAlign = "center";
                context.textBaseline = "hanging";
                const label = objectLabels.map((l) => formalContext.objects[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y + 7 * deviceScale);
            }

            if (attributeLabels) {
                context.textAlign = "center";
                context.textBaseline = "alphabetic";
                const label = attributeLabels.map((l) => formalContext.attributes[l]).join(", ").substring(0, 50);

                context.fillText(label, x, y - 7 * deviceScale);
            }
        }
    }, [lattice, concepts, formalContext, hoveredIndex, selectedIndex, targetPoints, visibleRect, deviceScale, visibleConceptIndexes]);

    const drawLinks = useCallback((context: CanvasRenderingContext2D, computedStyle: CSSStyleDeclaration) => {
        const outlineColor = computedStyle.getPropertyValue("--outline");

        context.strokeStyle = outlineColor;
        context.lineWidth = 1 * deviceScale;

        // It looks like a little batching of the lines to a single path is helpful only when zoomed out
        // However, it is much worse when zoomed in
        // I have no clue why...
        const linesCountInBatch = 1;
        let linesCount = 0;
        context.beginPath();

        for (const concept of concepts) {
            const subconcepts = lattice.subconceptsMapping[concept.index];
            const [startX, startY, normalStartX, normalStartY] = targetPoints[concept.index];

            for (const subconceptIndex of subconcepts) {
                const [endX, endY, normalEndX, normalEndY] = targetPoints[subconceptIndex];

                //if (!isInRect(normalStartX, normalStartY, visibleRect) && !isInRect(normalEndX, normalEndY, visibleRect)) {
                if (!crossesRect(normalStartX, normalStartY, normalEndX, normalEndY, visibleRect)) {
                    continue;
                }

                // It looks like a little batching is helpful
                if (linesCount !== 0 && linesCount % linesCountInBatch === 0) {
                    context.stroke();
                    context.beginPath();
                }

                context.moveTo(startX, startY);
                context.lineTo(endX, endY);

                linesCount++;
            }
        }

        context.stroke();
    }, [lattice, concepts, targetPoints, visibleRect, deviceScale]);

    return {
        drawNodes,
        drawLinks,
    };
}

function toLayoutCoord(coord: number, size: number) {
    return (coord - ((size / window.devicePixelRatio) / 2)) / LAYOUT_SCALE;
}

function getVisibleRect(zoomTransform: ZoomTransform, canvasWidth: number, canvasHeight: number): Rect {
    const nodeSizeAddition = (NODE_RADIUS) / LAYOUT_SCALE;
    const left = (zoomTransform.x / zoomTransform.scale) / LAYOUT_SCALE;
    const top = (zoomTransform.y / zoomTransform.scale) / LAYOUT_SCALE;
    const width = (canvasWidth / zoomTransform.scale) / LAYOUT_SCALE;
    const height = (canvasHeight / zoomTransform.scale) / LAYOUT_SCALE;
    const halfFactor = 2 / zoomTransform.scale;

    return {
        x: -(width / halfFactor) - left - nodeSizeAddition,
        y: -(height / halfFactor) - top - nodeSizeAddition,
        width: width + (2 * nodeSizeAddition),
        height: height + (2 * nodeSizeAddition),
    };
}

function drawOnCanvas(
    canvas: HTMLCanvasElement | null,
    canDraw: boolean,
    translateX: number,
    translateY: number,
    draw: (
        context: CanvasRenderingContext2D,
        computedStyle: CSSStyleDeclaration) => void,
) {
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
        return;
    }

    // Syncing the drawing with the browser refresh rate to reduce redraws
    requestAnimationFrame(() => {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (canDraw) {
            const computedStyle = getComputedStyle(canvas);
            context.save();
            context.translate(translateX * window.devicePixelRatio, translateY * window.devicePixelRatio);
            draw(context, computedStyle);
            context.restore();
        }
    });
}

function createNodeCanvas(
    radius: number,
    fillStyle: string | CanvasGradient | CanvasPattern
) {
    const baseNodeRadius = radius;
    const baseNodeSize = baseNodeRadius * 2.5;
    const nodeCanvas = document.createElement("canvas");
    nodeCanvas.width = nodeCanvas.height = Math.ceil(baseNodeSize);
    const nodeCanvasContext = nodeCanvas.getContext("2d")!;

    nodeCanvasContext.fillStyle = fillStyle;
    nodeCanvasContext.beginPath();
    nodeCanvasContext.moveTo(nodeCanvas.width / 2, nodeCanvas.height / 2);
    nodeCanvasContext.arc(nodeCanvas.width / 2, nodeCanvas.height / 2, baseNodeRadius, 0, 2 * Math.PI);
    nodeCanvasContext.fill();

    return nodeCanvas;
}