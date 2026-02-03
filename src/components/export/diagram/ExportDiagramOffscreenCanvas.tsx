import { useEffect, useRef } from "react";
import useExportDiagramStore from "../../../stores/export/diagram/useExportDiagramStore";
import useDebouncedValue from "../../../hooks/useDebouncedValue";
import { TransformComponent, TransformWrapper, useControls, useTransformComponent } from "react-zoom-pan-pinch";
import { cn } from "../../../utils/tailwind";
import ZoomBar from "../../ZoomBar";
import Button from "../../inputs/Button";
import { LuFocus } from "react-icons/lu";
import { AppearanceRequest, DimensionsRequest, InitCanvasRequest, InitLayoutRequest, InitLinksRequest, LabelGroupsRequest, LabelsAppearanceRequest } from "../../../types/workers/DiagramExportWorkerRequest";
import { hsvaToHexa } from "../../../utils/colors";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";

const DEBOUNCE_DELAY = 200;

export default function ExportDiagramOffscreenCanvas(props: {
    id: string,
    className?: string,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const worker = useExportDiagramStore((state) => state.worker);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!worker || !canvas || canvas.hasAttribute("transfered")) {
            return;
        }

        canvas.setAttribute("transfered", "true");
        const offscreenCanvas = canvas.transferControlToOffscreen();

        const message: InitCanvasRequest = {
            type: "init-canvas",
            canvas: offscreenCanvas,
        };
        worker.postMessage(message, [offscreenCanvas]);
    }, [worker]);

    useAppearance();
    useLabelsAppearance();
    useDimensions();
    useLayout();
    useLinks();
    useLabelGroups();

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
                    role="img" />
            </TransformComponent>

            <Controls
                className="absolute bottom-0 right-0" />

            <Centering />
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

function Centering() {
    const canvasDimensions = useExportDiagramStore((state) => state.canvasDimensions);
    const format = useExportDiagramStore((state) => state.selectedFormat);
    const scale = useTransformComponent(({ state }) => state.scale);
    const debouncedCanvasDimensions = useDebouncedValue(canvasDimensions, DEBOUNCE_DELAY);
    const { centerView } = useControls();

    useEffect(() => {
        setTimeout(() => centerView(scale), 100);
    }, [format, debouncedCanvasDimensions?.width, debouncedCanvasDimensions?.height]);

    return undefined;
}

function useDimensions() {
    const worker = useExportDiagramStore((state) => state.worker);
    const canvasDimensions = useExportDiagramStore((state) => state.canvasDimensions);

    useEffect(() => {
        if (!worker || !canvasDimensions) {
            return;
        }

        return debounced(() => {
            const message: DimensionsRequest = {
                type: "dimensions",
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                centerX: canvasDimensions.centerX,
                centerY: canvasDimensions.centerY,
                scale: canvasDimensions.scale,
            };
            worker.postMessage(message);
        });
    }, [worker, canvasDimensions]);
}

function useLayout() {
    const worker = useExportDiagramStore((state) => state.worker);
    const transformedLayout = useExportDiagramStore((state) => state.transformedLayout);

    useEffect(() => {
        if (!worker || !transformedLayout) {
            return;
        }

        return debounced(() => {
            const entriesCount = 2;
            const floatArray = new Float64Array(transformedLayout.length * entriesCount);

            for (let i = 0; i < transformedLayout.length; i++) {
                const point = transformedLayout[i];
                floatArray[i * entriesCount] = point[0];
                floatArray[(i * entriesCount) + 1] = point[1];
            }

            const message: InitLayoutRequest = {
                type: "init-layout",
                layout: floatArray.buffer,
            };
            worker.postMessage(message, [floatArray.buffer]);
        });
    }, [worker, transformedLayout]);
}

function useLinks() {
    const worker = useExportDiagramStore((state) => state.worker);
    const links = useExportDiagramStore((state) => state.links);

    useEffect(() => {
        if (!worker || !links) {
            return;
        }

        return debounced(() => {
            const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

            const entriesCount = 2;
            const floatArray = new Float64Array(links.length * entriesCount);

            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const fromIndex = conceptToLayoutIndexesMapping.get(link.conceptIndex)!;
                const toIndex = conceptToLayoutIndexesMapping.get(link.subconceptIndex)!;

                floatArray[i * entriesCount] = fromIndex;
                floatArray[(i * entriesCount) + 1] = toIndex;
            }

            const message: InitLinksRequest = {
                type: "init-links",
                links: floatArray.buffer,
            };
            worker.postMessage(message, [floatArray.buffer]);
        });
    }, [worker, links]);
}

function useAppearance() {
    const worker = useExportDiagramStore((state) => state.worker);
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const linkThickness = useExportDiagramStore((state) => state.linkThickness);
    const backgroundColor = useExportDiagramStore((state) => state.backgroundColor);
    const defaultNodeColor = useExportDiagramStore((state) => state.defaultNodeColor);
    const defaultLinkColor = useExportDiagramStore((state) => state.defaultLinkColor);

    useEffect(() => {
        if (!worker) {
            return;
        }

        return debounced(() => {
            const message: AppearanceRequest = {
                type: "appearance",
                nodeRadius,
                linkThickness,
                backgroundColorHexa: hsvaToHexa(backgroundColor),
                defaultNodeColorHexa: hsvaToHexa(defaultNodeColor),
                defaultLinkColorHexa: hsvaToHexa(defaultLinkColor),
            };
            worker.postMessage(message);
        });
    }, [worker, nodeRadius, linkThickness, backgroundColor, defaultNodeColor, defaultLinkColor]);
}

function useLabelGroups() {
    const worker = useExportDiagramStore((state) => state.worker);
    const labelGroups = useExportDiagramStore((state) => state.positionedLabelGroups);

    useEffect(() => {
        if (!worker) {
            return;
        }

        return debounced(() => {
            const message: LabelGroupsRequest = {
                type: "label-groups",
                labelGroups,
            };
            worker.postMessage(message);
        });
    }, [worker, labelGroups]);
}

function useLabelsAppearance() {
    const worker = useExportDiagramStore((state) => state.worker);
    const font = useExportDiagramStore((state) => state.font);
    const textSize = useExportDiagramStore((state) => state.textSize);
    const textColor = useExportDiagramStore((state) => state.textColor);
    const textBackgroundColor = useExportDiagramStore((state) => state.textBackgroundColor);
    const textOutlineColor = useExportDiagramStore((state) => state.textOutlineColor);
    const textBackgroundType = useExportDiagramStore((state) => state.textBackgroundType);

    useEffect(() => {
        if (!worker) {
            return;
        }

        return debounced(() => {
            const message: LabelsAppearanceRequest = {
                type: "labels-appearance",
                font,
                textSize,
                textBackgroundType,
                textColorHexa: hsvaToHexa(textColor),
                textBackgroundColorHexa: hsvaToHexa(textBackgroundColor),
                textOutlineColorHexa: hsvaToHexa(textOutlineColor),
            };
            worker.postMessage(message);
        });
    }, [worker, font, textSize, textColor, textBackgroundColor, textOutlineColor, textBackgroundType]);
}

function debounced(callback: () => void) {
    const timeout = setTimeout(callback, DEBOUNCE_DELAY);
    return () => clearTimeout(timeout);
}