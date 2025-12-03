import { useEffect, useRef } from "react";
import { cn } from "../../utils/tailwind";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import { transformedPoint } from "../../utils/layout";
import { createPoint, Point } from "../../types/Point";
import { TransformWrapper, TransformComponent, useControls, useTransformComponent } from "react-zoom-pan-pinch";
import ZoomBar from "../ZoomBar";
import Button from "../inputs/Button";
import { LuFocus } from "react-icons/lu";
import useLinks from "../concepts/diagram/useLinks";
import useExportDiagramStore from "../../stores/export/useExportDiagramStore";
import { hsvaToHexa } from "../../utils/colors";

type CanvasDimensions = {
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
}

/*
I tried to use transferControlToOffscreen() and do all the drawing in a worker.
However, drawing and modifying the canvas (width and size) stopped working from a certain size of the canvas –
even though the size was within the limit supported by the browser (https://jhildenbiddle.github.io/canvas-size/#/?id=test-results).
I do not know why that is. The canvas pixels should be stored in a single shared buffer for both the main thread and the worker.

So I do everything in the main thread...
*/

export default function ExportDiagramCanvas(props: {
    className?: string,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const transformedLayout = useTransformedLayout();
    const canvasDimensions = useCanvasDimensions(transformedLayout);

    useDrawing(canvasRef, canvasDimensions, transformedLayout);

    return (
        <TransformWrapper
            centerOnInit
            disablePadding
            minScale={0.1}>
            <TransformComponent
                wrapperClass={cn("checkered", props.className)}
                wrapperStyle={{
                    width: "100%",
                    height: "100%",
                }}
                contentClass="drop-shadow-xl">
                <canvas
                    ref={canvasRef}
                    style={{
                        // imageRendering: "pixelated",
                    }}
                    role="img"
                    width={canvasDimensions?.width}
                    height={canvasDimensions?.height} />
            </TransformComponent>

            <Controls
                className="absolute bottom-0 right-0" />
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

function useDrawing(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    canvasDimensions: CanvasDimensions | null,
    layout: Array<Point> | null,
) {
    const drawBackground = useDrawBackground();
    const drawNodes = useDrawNodes(layout, canvasDimensions?.scale || 0);
    const drawLinks = useDrawLinks(layout, canvasDimensions?.scale || 0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvasRef.current?.getContext("2d");

        if (!canvas || !context || !canvasDimensions) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground(context);

        context.save();
        context.translate(canvasDimensions.centerX, canvasDimensions.centerY);
        drawLinks(context);
        drawNodes(context);
        context.restore();
    }, [
        drawBackground,
        drawNodes,
        drawLinks,
        canvasDimensions?.width,
        canvasDimensions?.height,
        canvasDimensions?.centerX,
        canvasDimensions?.centerY,
    ]);
}

function useTransformedLayout() {
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);

    if (!layout || !diagramOffsets) {
        return null;
    }

    return layout.map((point, i) => transformedPoint(
        createPoint(point.x, point.y, point.z),
        diagramOffsets[i],
        [0, 0, 0],
        horizontalScale,
        verticalScale,
        rotationDegrees,
        "2d"));
}

function useCanvasDimensions(
    layout: Array<Point> | null,
) : CanvasDimensions | null {
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);

    const scale = 80;

    if (!layout) {
        return null;
    }

    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    for (const point of layout) {
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
    }

    const nodeDiameter = 2 * nodeRadius;
    const width = (maxX - minX) * scale + nodeDiameter;
    const height = (maxY - minY) * scale + nodeDiameter;
    const centerX = -minX * scale + nodeRadius;
    const centerY = -minY * scale + nodeRadius;

    return {
        width,
        height,
        centerX,
        centerY: height - centerY,
        scale,
    };
}

function useDrawBackground() {
    const backgroundColor = useExportDiagramStore((state) => state.backgroundColor);

    function drawBackground(context: CanvasRenderingContext2D) {
        context.save();
        context.fillStyle = hsvaToHexa(backgroundColor);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }

    return drawBackground;
}

function useDrawNodes(
    layout: Array<Point> | null,
    scale: number,
) {
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const defaultNodeColor = useExportDiagramStore((state) => state.defaultNodeColor);

    function drawNodes(context: CanvasRenderingContext2D) {
        if (!layout) {
            return;
        }

        context.save();
        context.fillStyle = hsvaToHexa(defaultNodeColor);

        for (let i = 0; i < layout.length; i++) {
            const point = layout[i];
            const x = point[0] * scale;
            const y = -point[1] * scale;

            context.beginPath();
            context.arc(x, y, nodeRadius, 0, 2 * Math.PI);
            context.fill();
        }

        context.restore();
    }

    return drawNodes;
}

function useDrawLinks(
    layout: Array<Point> | null,
    scale: number,
) {
    const links = useLinks();
    const linkThickness = useExportDiagramStore((state) => state.linkThickness);
    const defaultLinkColor = useExportDiagramStore((state) => state.defaultLinkColor);

    function drawLinks(
        context: CanvasRenderingContext2D,
    ) {
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
    }

    return drawLinks;
}