import { useCallback, useEffect, useRef } from "react";
import { cn } from "../../../utils/tailwind";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { Point } from "../../../types/Point";
import { TransformWrapper, TransformComponent, useControls, useTransformComponent } from "react-zoom-pan-pinch";
import ZoomBar from "../../ZoomBar";
import Button from "../../inputs/Button";
import { LuFocus } from "react-icons/lu";
import useLinks from "../../concepts/diagram/useLinks";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import { hsvaToHexa } from "../../../utils/colors";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { outlineWidth } from "../../../utils/export";
import { TextBackgroundType } from "../../../types/export/TextBackgroundType";
import { HsvaColor } from "../../../types/HsvaColor";
import { Font } from "../../../types/export/Font";
import { LabelGroup } from "../../../types/export/LabelGroup";
import { CanvasDimensions } from "../../../types/export/CanvasDimensions";

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
    const canvasDimensions = useExportDiagramStore((state) => state.canvasDimensions);
    const debouncedCanvasDimensions = useDebouncedValue(canvasDimensions, DEBOUNCE_DELAY);

    useDrawing(canvasRef, canvasDimensions, debouncedCanvasDimensions);

    return (
        <TransformWrapper
            centerOnInit
            disablePadding
            minScale={0.05}>
            <TransformComponent
                wrapperClass={cn("export-diagram-canvas-wrapper checkered", props.className)}
                wrapperStyle={{
                    width: "100%",
                    height: "100%",
                }}
                contentClass="border border-dashed border-outline border-2">
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
) {
    const drawBackground = useDrawBackground();
    const drawNodes = useDrawNodes(canvasDimensions?.scale || 0);
    const drawLinks = useDrawLinks(canvasDimensions?.scale || 0);
    const drawLabels = useDrawLabels(canvasDimensions?.scale || 0);

    // This is a quite hacky solution and may cause bugs
    const drawBackgroundDebounced = useDebouncedValue<DrawFunc | undefined>(drawBackground, DEBOUNCE_DELAY);
    const drawNodesDebounced = useDebouncedValue<DrawFunc | undefined>(drawNodes, DEBOUNCE_DELAY);
    const drawLinksDebounced = useDebouncedValue<DrawFunc | undefined>(drawLinks, DEBOUNCE_DELAY);
    const drawLabelsDebounced = useDebouncedValue<DrawFunc | undefined>(drawLabels, DEBOUNCE_DELAY);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvasRef.current?.getContext("2d");

        if (
            !canvas ||
            !context ||
            !debouncedCanvasDimensions ||
            !drawBackgroundDebounced ||
            !drawNodesDebounced ||
            !drawLinksDebounced ||
            !drawLabelsDebounced
        ) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackgroundDebounced(context);

        context.save();
        context.translate(debouncedCanvasDimensions.centerX, debouncedCanvasDimensions.centerY);
        drawLinksDebounced(context);
        drawNodesDebounced(context);
        drawLabelsDebounced(context);
        context.restore();
    }, [
        drawBackgroundDebounced,
        drawNodesDebounced,
        drawLinksDebounced,
        drawLabelsDebounced,
        debouncedCanvasDimensions?.centerX,
        debouncedCanvasDimensions?.centerY,
        debouncedCanvasDimensions?.width,
        debouncedCanvasDimensions?.height,
    ]);
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
    scale: number,
) {
    const layout = useExportDiagramStore((state) => state.transformedLayout);
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
    }, [layout, nodeRadius, defaultNodeColorHexa, scale]);
}

function useDrawLinks(
    scale: number,
) {
    const links = useLinks();
    const layout = useExportDiagramStore((state) => state.transformedLayout);
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
    }, [layout, links, linkThickness, defaultLinkColor, scale]);
}

function useDrawLabels(
    scale: number,
) {
    const layout = useExportDiagramStore((state) => state.transformedLayout);
    const labelGroups = useExportDiagramStore((state) => state.positionedLabelGroups);
    const font = useExportDiagramStore((state) => state.font);
    const textSize = useExportDiagramStore((state) => state.textSize);
    const textColor = useExportDiagramStore((state) => state.textColor);
    const textBackgroundColor = useExportDiagramStore((state) => state.textBackgroundColor);
    const textOutlineColor = useExportDiagramStore((state) => state.textOutlineColor);
    const textBackgroundType = useExportDiagramStore((state) => state.textBackgroundType);

    return useCallback((context: CanvasRenderingContext2D) => {
        if (!layout) {
            return;
        }

        drawLabels(context, layout, scale, labelGroups, font, textBackgroundType, textSize, textColor, textBackgroundColor, textOutlineColor);
    }, [layout, scale, labelGroups, font, textBackgroundType, textSize, textColor, textBackgroundColor, textOutlineColor]);
}

function drawLabels(
    context: CanvasRenderingContext2D,
    layout: Array<Point>,
    scale: number,
    labelGroups: Array<LabelGroup>,
    font: Font,
    textBackgroundType: TextBackgroundType,
    textSize: number,
    textColor: HsvaColor,
    textBackgroundColor: HsvaColor,
    textOutlineColor: HsvaColor,
) {
    const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
    const textColorHexa = hsvaToHexa(textColor);
    const textBackgroundColorHexa = hsvaToHexa(textBackgroundColor);
    const textOutlineColorHexa = hsvaToHexa(textOutlineColor);
    const textOutlineWidth = outlineWidth(textSize);

    context.lineCap = "round";
    context.lineJoin = "round";
    context.textBaseline = "hanging";

    context.font = `${textSize}px ${font}`;

    for (const group of labelGroups) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(group.conceptIndex);

        if (layoutIndex === undefined || layoutIndex >= layout.length) {
            console.error(`Layout index should not be ${layoutIndex}`);
            continue;
        }

        const point = layout[layoutIndex];
        const nodeX = point[0] * scale;
        const nodeY = -point[1] * scale;

        if (textBackgroundType === "box") {
            context.fillStyle = textBackgroundColorHexa;
            context.strokeStyle = textOutlineColorHexa;
            context.lineWidth = 1;

            const outlineMargin = context.lineWidth / 2;
            const outlineMarginDoubled = outlineMargin * 2;

            const x = nodeX + group.relativeRect.x + outlineMargin;
            const y = nodeY + group.relativeRect.y + outlineMargin;
            const width = group.relativeRect.width - outlineMarginDoubled;
            const height = group.relativeRect.height - outlineMarginDoubled;

            context.beginPath();
            context.roundRect(x, y, width, height, textSize / 4);
            context.fill();
            context.stroke();
        }

        context.fillStyle = textColorHexa;

        for (const label of group.labels) {
            const x = nodeX + group.relativeRect.x + label.relativeRect.x;
            const y = nodeY + group.relativeRect.y + label.relativeRect.y;

            if (textBackgroundType === "outline") {
                context.strokeStyle = textBackgroundColorHexa;
                context.lineWidth = textOutlineWidth;

                context.strokeText(label.text, x, y);
            }
            context.fillText(label.text, x, y);
        }
    }
}