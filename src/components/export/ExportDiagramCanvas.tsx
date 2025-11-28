import { useEffect, useRef } from "react";
import { cn } from "../../utils/tailwind";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ExportDiagramOptions } from "../../types/ExportDiagramOptions";
import { transformedPoint } from "../../utils/layout";
import { createPoint, Point } from "../../types/Point";
import { CameraType } from "../../types/CameraType";
import { TransformWrapper, TransformComponent, useControls, useTransformComponent } from "react-zoom-pan-pinch";
import ZoomBar from "../ZoomBar";
import Button from "../inputs/Button";
import { LuFocus } from "react-icons/lu";
import useLinks from "../concepts/diagram/useLinks";
import { Link } from "../../types/Link";

const DEFAULT_OPTIONS: ExportDiagramOptions = {
    scale: 80,
    nodeRadius: 8,
} as const;

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
    const layout = useDiagramStore((state) => state.layout);
    const diagramOffsets = useDiagramStore((state) => state.diagramOffsets);
    const horizontalScale = useDiagramStore((state) => state.horizontalScale);
    const verticalScale = useDiagramStore((state) => state.verticalScale);
    const rotationDegrees = useDiagramStore((state) => state.rotationDegrees);
    const transformedLayout = useTransformedLayout(layout, diagramOffsets, horizontalScale, verticalScale, rotationDegrees, "2d");
    const links = useLinks();

    const options = DEFAULT_OPTIONS;
    const canvasDimensions = useCanvasDimensions(transformedLayout, options);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvasRef.current?.getContext("2d");

        if (!canvas || !context || !transformedLayout || !canvasDimensions) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.save();
        context.translate(canvasDimensions.centerX, canvasDimensions.centerY);
        drawLinks(context, transformedLayout, links, options);
        drawNodes(context, transformedLayout, options);
        context.restore();
    }, [
        transformedLayout,
        links,
        options,
        canvasDimensions?.width,
        canvasDimensions?.height,
        canvasDimensions?.centerX,
        canvasDimensions?.centerY,
    ]);

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

function useTransformedLayout(
    layout: ConceptLatticeLayout | null,
    diagramOffsets: Array<Point> | null,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    cameraType: CameraType,
) {
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
        cameraType));
}

function useCanvasDimensions(
    layout: Array<Point> | null,
    options: ExportDiagramOptions,
) {
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

    const nodeDiameter = 2 * options.nodeRadius;
    const width = (maxX - minX) * options.scale + nodeDiameter;
    const height = (maxY - minY) * options.scale + nodeDiameter;
    const centerX = -minX * options.scale + options.nodeRadius;
    const centerY = -minY * options.scale + options.nodeRadius;

    return {
        width,
        height,
        centerX,
        centerY: height - centerY,
    };
}

function drawNodes(
    context: CanvasRenderingContext2D,
    layout: Array<Point>,
    options: ExportDiagramOptions,
) {
    for (let i = 0; i < layout.length; i++) {
        const point = layout[i];
        const x = point[0] * options.scale;
        const y = -point[1] * options.scale;

        context.beginPath();
        context.arc(x, y, options.nodeRadius, 0, 2 * Math.PI);
        context.fill();
    }
}

function drawLinks(
    context: CanvasRenderingContext2D,
    layout: Array<Point>,
    links: Array<Link>,
    options: ExportDiagramOptions,
) {
    const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

    for (const link of links) {
        const fromIndex = conceptToLayoutIndexesMapping.get(link.conceptIndex)!;
        const toIndex = conceptToLayoutIndexesMapping.get(link.subconceptIndex)!;
        const from = layout[fromIndex];
        const to = layout[toIndex];

        context.beginPath();
        context.moveTo(from[0] * options.scale, -from[1] * options.scale);
        context.lineTo(to[0] * options.scale, -to[1] * options.scale);
        context.stroke();
    }
}