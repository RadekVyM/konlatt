import { useCallback, useContext, useEffect, useRef } from "react";
import { cn } from "../../../utils/tailwind";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import ZoomBar from "../../ZoomBar";
import Button from "../../inputs/Button";
import { LuFocus } from "react-icons/lu";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import { hsvaToHexa } from "../../../utils/colors";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { CanvasDimensions } from "../../../types/export/CanvasDimensions";
import { drawLabels } from "../../../utils/drawing";
import { ExportDiagramZoomContext, ExportDiagramZoomContextProvider } from "../../../contexts/ExportDiagramZoomContext";
import PanZoomContainer from "./PanZoomContainer";

const DEBOUNCE_DELAY = 200;

/**
 * Canvas for the exported diagram preview that does all its rendering logic in the main thread.
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
        <ExportDiagramZoomContextProvider>
            <PanZoomContainer
                className={cn("export-diagram-canvas-wrapper checkered", props.className)}
                contentWrapperClassName="border border-dashed border-outline border-2">
                <canvas
                    ref={canvasRef}
                    id={props.id}
                    style={{
                        // imageRendering: "pixelated",
                    }}
                    role="img"
                    width={debouncedCanvasDimensions?.width}
                    height={debouncedCanvasDimensions?.height} />
            </PanZoomContainer>

            <Controls
                className="absolute bottom-0 right-0" />

            <Centering
                canvasRef={canvasRef}
                canvasDimensions={debouncedCanvasDimensions} />
        </ExportDiagramZoomContextProvider>
    );
}

function Controls(props: {
    className?: string,
}) {
    const { actions: zoomActions, scale } = useContext(ExportDiagramZoomContext);

    return (
        <div
            className={cn("m-3 flex gap-2", props.className)}>
           <ZoomBar
                onIncreaseClick={() => zoomActions.current?.zoomIn()}
                onDecreaseClick={() => zoomActions.current?.zoomOut()}
                currentZoomLevel={scale} />

            <Button
                title="Zoom to center"
                variant="icon-secondary"
                onClick={() => zoomActions.current?.centerView(1)}>
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
    const { actions: zoomActions, scale } = useContext(ExportDiagramZoomContext);

    useEffect(() => {
        setTimeout(() => zoomActions.current?.centerView(scale), 100);
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
    const links = useExportDiagramStore((state) => state.links);
    const layout = useExportDiagramStore((state) => state.transformedLayout);
    const linkThickness = useExportDiagramStore((state) => state.linkThickness);
    const defaultLinkColor = useExportDiagramStore((state) => state.defaultLinkColor);

    return useCallback((context: CanvasRenderingContext2D) => {
        if (!layout || !links) {
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

        drawLabels(
            context,
            labelGroups,
            font,
            textBackgroundType,
            textSize,
            hsvaToHexa(textColor),
            hsvaToHexa(textBackgroundColor),
            hsvaToHexa(textOutlineColor),
            (layoutIndex) => {
                if (layoutIndex >= layout.length) {
                    console.error(`Layout index of the label group should not be ${layoutIndex}`);
                    return null;
                }

                const point = layout[layoutIndex];
                return [point[0] * scale, point[1] * scale];
            });
    }, [layout, scale, labelGroups, font, textBackgroundType, textSize, textColor, textBackgroundColor, textOutlineColor]);
}