import { useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "../../../utils/tailwind";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { Point } from "../../../types/Point";
import { TransformWrapper, TransformComponent, useControls, useTransformComponent } from "react-zoom-pan-pinch";
import ZoomBar from "../../ZoomBar";
import Button from "../../inputs/Button";
import { LuFocus } from "react-icons/lu";
import useLinks from "../../concepts/diagram/useLinks";
import useExportDiagramStore from "../../../stores/export/useExportDiagramStore";
import { hsvaToHexa } from "../../../utils/colors";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { transformedLayoutForExport } from "../../../utils/export";
import { layoutRect } from "../../../utils/layout";

type CanvasDimensions = {
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
}

const DEBOUNCE_DELAY = 200;

/*
I tried to use transferControlToOffscreen() and do all the drawing in a worker.
However, drawing and modifying the canvas (width and size) stopped working from a certain size of the canvas –
even though the size was within the limit supported by the browser (https://jhildenbiddle.github.io/canvas-size/#/?id=test-results).
I do not know why that is. The canvas pixels should be stored in a single shared buffer for both the main thread and the worker.

So I do everything in the main thread...
*/

export default function ExportDiagramCanvas(props: {
    id: string,
    className?: string,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const transformedLayout = useTransformedLayout();
    const canvasDimensions = useCanvasDimensions(transformedLayout);
    const debouncedCanvasDimensions = useDebouncedValue(canvasDimensions, DEBOUNCE_DELAY);

    useDrawing(canvasRef, canvasDimensions, debouncedCanvasDimensions, transformedLayout);

    return (
        <TransformWrapper
            centerOnInit
            disablePadding
            minScale={0.1}>
            <TransformComponent
                wrapperClass={cn("export-diagram-canvas-wrapper checkered", props.className)}
                wrapperStyle={{
                    width: "100%",
                    height: "100%",
                }}
                contentClass="drop-shadow-xl">
                <canvas
                    ref={canvasRef}
                    id={props.id}
                    style={{
                        // imageRendering: "pixelated",
                    }}
                    role="img"
                    width={debouncedCanvasDimensions?.width}
                    height={debouncedCanvasDimensions?.height} />
            </TransformComponent>

            <Controls
                className="absolute bottom-0 right-0" />

            <Centering
                canvasRef={canvasRef}
                canvasDimensions={debouncedCanvasDimensions} />
        </TransformWrapper>
    );
}

function Controls(props: {
    className?: string,
}) {
    const scale = useTransformComponent(({ state }) => state.scale);
    const { zoomIn, zoomOut, centerView } = useControls();

    return (
        <div
            className={cn("m-3 flex gap-2", props.className)}>
            <ZoomBar
                onIncreaseClick={() => zoomIn()}
                onDecreaseClick={() => zoomOut()}
                currentZoomLevel={scale} />

            <Button
                title="Zoom to center"
                variant="icon-secondary"
                onClick={() => centerView(1)}>
                <LuFocus />
            </Button>
        </div>
    );
}

function Centering(props: {
    canvasDimensions: CanvasDimensions | null,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
}) {
    const format = useExportDiagramStore((state) => state.selectedFormat);
    const scale = useTransformComponent(({ state }) => state.scale);
    const { centerView } = useControls();

    useEffect(() => {
        setTimeout(() => centerView(scale), 100);
    }, [format, props.canvasDimensions?.width, props.canvasDimensions?.height]);

    return undefined;
}

type DrawFunc = (context: CanvasRenderingContext2D) => void

function useDrawing(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    canvasDimensions: CanvasDimensions | null,
    debouncedCanvasDimensions: CanvasDimensions | null,
    layout: Array<Point> | null,
) {
    const drawBackground = useDrawBackground();
    const drawNodes = useDrawNodes(layout, canvasDimensions?.scale || 0);
    const drawLinks = useDrawLinks(layout, canvasDimensions?.scale || 0);

    // This is a quite hacky solution and may cause bugs
    const drawBackgroundDebounced = useDebouncedValue<DrawFunc | undefined>(drawBackground, DEBOUNCE_DELAY);
    const drawNodesDebounced = useDebouncedValue<DrawFunc | undefined>(drawNodes, DEBOUNCE_DELAY);
    const drawLinksDebounced = useDebouncedValue<DrawFunc | undefined>(drawLinks, DEBOUNCE_DELAY);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvasRef.current?.getContext("2d");

        if (
            !canvas ||
            !context ||
            !debouncedCanvasDimensions ||
            !drawBackgroundDebounced ||
            !drawNodesDebounced ||
            !drawLinksDebounced
        ) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackgroundDebounced(context);

        context.save();
        context.translate(debouncedCanvasDimensions.centerX, debouncedCanvasDimensions.centerY);
        drawLinksDebounced(context);
        drawNodesDebounced(context);
        context.restore();
    }, [
        drawBackgroundDebounced,
        drawNodesDebounced,
        drawLinksDebounced,
        debouncedCanvasDimensions?.centerX,
        debouncedCanvasDimensions?.centerY,
        debouncedCanvasDimensions?.width,
        debouncedCanvasDimensions?.height,
    ]);
}

function useTransformedLayout() {
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);

    return transformedLayoutForExport(layout, diagramOffsets, horizontalScale, verticalScale, rotationDegrees);
}

function useCanvasDimensions(layout: Array<Point> | null) : CanvasDimensions | null {
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const maxWidth = useExportDiagramStore((state) => state.maxWidth);
    const maxHeight = useExportDiagramStore((state) => state.maxHeight);
    const minPaddingLeft = useExportDiagramStore((state) => state.minPaddingLeft);
    const minPaddingRight = useExportDiagramStore((state) => state.minPaddingRight);
    const minPaddingTop = useExportDiagramStore((state) => state.minPaddingTop);
    const minPaddingBottom = useExportDiagramStore((state) => state.minPaddingBottom);

    return useMemo(() => {
        if (!layout) {
            return null;
        }

        const rect = layoutRect(layout);

        const diagramWidth = rect.width;
        const diagramHeight = rect.height;

        const nodeDiameter = 2 * nodeRadius;
        const horizontalPadding = minPaddingLeft + minPaddingRight + nodeDiameter;
        const verticalPadding = minPaddingTop + minPaddingBottom + nodeDiameter;
        const maxDiagramWidth = Math.max(maxWidth - horizontalPadding, 0);
        const maxDiagramHeight = Math.max(maxHeight - verticalPadding, 0);

        const maxRatio = maxDiagramHeight === 0 ? Number.MAX_VALUE : maxDiagramWidth / maxDiagramHeight;
        const diagramRatio = diagramHeight === 0 ? Number.MAX_VALUE : diagramWidth / diagramHeight;

        const isZeroSizeDiagram = diagramWidth === 0 && diagramHeight === 0;
        const width = isZeroSizeDiagram ?
            0 :
            Math.ceil(diagramRatio > maxRatio ? maxDiagramWidth : diagramRatio * maxDiagramHeight);
        const height = isZeroSizeDiagram ?
            0 :
            Math.ceil(diagramRatio > maxRatio ? maxDiagramWidth / diagramRatio : maxDiagramHeight);

        const scale = isZeroSizeDiagram ?
            1 :
            diagramWidth === 0 ?
                height / diagramHeight :
                diagramHeight === 0 ?
                    width / diagramWidth : 
                    Math.min(width / diagramWidth, height / diagramHeight);
        const centerX = -rect.left * scale + nodeRadius + minPaddingLeft;
        const centerY = -rect.top * scale + nodeRadius + minPaddingBottom;

        const finalWidth = Math.min(width + horizontalPadding, maxWidth);
        const finalHeight = Math.min(height + verticalPadding, maxHeight);

        return {
            width: finalWidth,
            height: finalHeight,
            centerX,
            centerY: finalHeight - centerY,
            scale,
        };
    }, [layout, nodeRadius, maxWidth, maxHeight, minPaddingLeft, minPaddingRight, minPaddingTop, minPaddingBottom]);
}

function useDrawBackground() {
    const backgroundColor = useExportDiagramStore((state) => state.backgroundColor);

    return useCallback((context: CanvasRenderingContext2D) => {
        context.save();
        context.fillStyle = hsvaToHexa(backgroundColor);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }, [backgroundColor]);
}

function useDrawNodes(
    layout: Array<Point> | null,
    scale: number,
) {
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const defaultNodeColor = useExportDiagramStore((state) => state.defaultNodeColor);
    const defaultNodeColorHexa = hsvaToHexa(defaultNodeColor);

    return useCallback((context: CanvasRenderingContext2D) => {
        if (!layout) {
            return;
        }

        context.save();
        context.fillStyle = defaultNodeColorHexa;

        for (let i = 0; i < layout.length; i++) {
            const point = layout[i];
            const x = point[0] * scale;
            const y = -point[1] * scale;

            context.beginPath();
            context.arc(x, y, nodeRadius, 0, 2 * Math.PI);
            context.fill();
        }

        context.restore();
    }, [nodeRadius, defaultNodeColorHexa, scale]);
}

function useDrawLinks(
    layout: Array<Point> | null,
    scale: number,
) {
    const links = useLinks();
    const linkThickness = useExportDiagramStore((state) => state.linkThickness);
    const defaultLinkColor = useExportDiagramStore((state) => state.defaultLinkColor);

    return useCallback((context: CanvasRenderingContext2D) => {
        if (!layout) {
            return;
        }

        const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

        context.save();
        context.lineWidth = linkThickness;
        context.strokeStyle = hsvaToHexa(defaultLinkColor);

        for (const link of links) {
            const fromIndex = conceptToLayoutIndexesMapping.get(link.conceptIndex)!;
            const toIndex = conceptToLayoutIndexesMapping.get(link.subconceptIndex)!;
            const from = layout[fromIndex];
            const to = layout[toIndex];

            context.beginPath();
            context.moveTo(from[0] * scale, -from[1] * scale);
            context.lineTo(to[0] * scale, -to[1] * scale);
            context.stroke();
        }

        context.restore();
    }, [links, linkThickness, defaultLinkColor, scale]);
}