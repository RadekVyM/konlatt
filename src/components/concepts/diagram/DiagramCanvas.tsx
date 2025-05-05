import { useEffect, useMemo, useRef, useState } from "react";
import useDimensions from "../../../hooks/useDimensions";
import { ZoomTransform } from "../../../types/d3/ZoomTransform";
import { Point } from "../../../types/Point";
import { Rect } from "../../../types/Rect";
import { cn } from "../../../utils/tailwind";
import { LAYOUT_SCALE, NODE_RADIUS } from "../../../constants/diagram";
import useDiagramStore from "../../../stores/useDiagramStore";
import useCanvasInteraction from "./hooks/useCanvasInteraction";
import useDrawGrid from "./hooks/useDrawGrid";
import useDrawDiagram from "./hooks/useDrawDiagram";
import useDrawEditInteraction from "./hooks/useDrawEditInteraction";

export default function DiagramCanvas(props: {
    className?: string,
    ref: React.RefObject<HTMLDivElement | null>,
    zoomTransform: ZoomTransform,
    isEditable: boolean,
    isDragZooming: boolean,
    updateExtent: (width: number, height: number) => void,
    updateNodeOffsets: (nodes: Iterable<number>, offset: Point) => void,
}) {
    const gridCanvasRef = useRef<HTMLCanvasElement>(null);
    const linksCanvasRef = useRef<HTMLCanvasElement>(null);
    const highlightedLinksCanvasRef = useRef<HTMLCanvasElement>(null);
    const nodesCanvasRef = useRef<HTMLCanvasElement>(null);
    const editCanvasRef = useRef<HTMLCanvasElement>(null);
    const dimensions = useDimensions(props.ref);
    const width = dimensions.width * window.devicePixelRatio;
    const height = dimensions.height * window.devicePixelRatio;
    const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
    const areThereInvisibleNodes = !!useDiagramStore((state) => state.visibleConceptIndexes);
    const visibleRect = useMemo(() => getVisibleRect(props.zoomTransform, dimensions.width, dimensions.height), [props.zoomTransform, dimensions.width, dimensions.height]);
    const {
        dragOffset,
        dragSelectionRect,
        draggedConceptIndexes,
        draggedConceptsRect,
        onPointerDown,
        onPointerMove,
        onClick,
    } = useCanvasInteraction(
        props.ref,
        props.zoomTransform,
        width,
        height,
        props.isEditable,
        props.isDragZooming,
        setHoveredIndex,
        props.updateNodeOffsets);
    const {
        drawNodes,
        drawLinks,
        drawHighlightedLinks,
    } = useDrawDiagram(
        hoveredIndex,
        draggedConceptIndexes,
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
    const drawEditInteraction = useDrawEditInteraction(
        dragSelectionRect,
        draggedConceptIndexes,
        draggedConceptsRect,
        dragOffset,
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
            editCanvasRef.current,
            props.isEditable,
            props.zoomTransform.x,
            props.zoomTransform.y,
            drawEditInteraction
        );
    }, [props.zoomTransform.x, props.zoomTransform.y, props.isEditable, drawEditInteraction]);

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
            highlightedLinksCanvasRef.current,
            true,
            props.zoomTransform.x,
            props.zoomTransform.y,
            drawHighlightedLinks
        );
    }, [props.zoomTransform.x, props.zoomTransform.y, drawHighlightedLinks]);

    useEffect(() => {
        drawOnCanvas(
            nodesCanvasRef.current,
            true,
            props.zoomTransform.x,
            props.zoomTransform.y,
            drawNodes
        );
    }, [props.zoomTransform.x, props.zoomTransform.y, drawNodes]);

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
            {props.isEditable &&
                <canvas
                    ref={gridCanvasRef}
                    className="absolute inset-0 w-full h-full"
                    width={width}
                    height={height} />}
            <canvas
                ref={linksCanvasRef}
                className={cn("absolute inset-0 w-full h-full", areThereInvisibleNodes && "opacity-35")}
                width={width}
                height={height} />
            {areThereInvisibleNodes &&
                <canvas
                    ref={highlightedLinksCanvasRef}
                    className="absolute inset-0 w-full h-full"
                    width={width}
                    height={height} />}
            <canvas
                ref={nodesCanvasRef}
                className="absolute inset-0 w-full h-full"
                width={width}
                height={height} />
            {props.isEditable &&
                <canvas
                    ref={editCanvasRef}
                    className="absolute inset-0 w-full h-full"
                    width={width}
                    height={height} />}
        </div>
    );
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