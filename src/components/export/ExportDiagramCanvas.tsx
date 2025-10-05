import { useEffect, useMemo, useRef } from "react";
import { cn } from "../../utils/tailwind";
import { create } from "zustand";
import DiagramCanvasWorker from "../../workers/exportDiagramCanvasWorker?worker";
import { ExportDiagramInitCanvasRequest, ExportDiagramInitLayoutRequest, ExportDiagramInitLinksRequest, ExportDiagramOptionsRequest } from "../../types/ExportDiagramCanvasWorkerRequest";
import useDiagramStore from "../../stores/diagram/useDiagramStore";
import useDataStructuresStore from "../../stores/useDataStructuresStore";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { ExportDiagramOptions } from "../../types/ExportDiagramOptions";

const useWorkerStore = create<{
    worker: Worker,
}>(() => ({
    worker: new DiagramCanvasWorker(),
}));

const DEFAULT_OPTIONS: ExportDiagramOptions = {
    scale: 50,
    nodeRadius: 5,
}

export default function ExportDiagramCanvas(props: {
    className?: string,
}) {
    const divRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lattice = useDataStructuresStore((state) => state.lattice);
    const layout = useDiagramStore((state) => state.layout);
    const worker = useWorkerStore((state) => state.worker);

    const options = DEFAULT_OPTIONS;
    const canvasDimensions = useCanvasDimensions(layout, options);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvasRef.current?.getContext("2d");

        if (!canvas || !context || !layout || !canvasDimensions) {
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        console.log(canvas.width, canvas.height);
        context.save();
        context.translate(canvasDimensions.centerX, canvasDimensions.centerY);
        drawDiagram(context, layout, options);
        context.restore();
    }, [layout, options, canvasDimensions?.width, canvasDimensions?.height, canvasDimensions?.centerX, canvasDimensions?.centerY]);

/*

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas || canvas.hasAttribute("transfered")) {
            return;
        }

        canvas.setAttribute("transfered", "true");
        const offscreenCanvas = canvas.transferControlToOffscreen();

        const message: ExportDiagramInitCanvasRequest = {
            type: "init-canvas",
            canvas: offscreenCanvas,
        };
        worker.postMessage(message, [offscreenCanvas]);
    }, []);

    useEffect(() => {
        if (!layout) {
            return;
        }

        const floatArray = new Float64Array(layout.length * 3);

        for (let i = 0; i < layout.length; i++) {
            const point = layout[i];
            floatArray[i * 3] = point.x;
            floatArray[(i * 3) + 1] = point.y;
            floatArray[(i * 3) + 2] = point.z;
        }

        const message: ExportDiagramInitLayoutRequest = {
            type: "init-layout",
            nodesCount: layout.length,
            layout: floatArray.buffer,
        };

        worker.postMessage(message);
    }, [layout]);

    useEffect(() => {
        if (!lattice) {
            return;
        }

        const linksCount = lattice.subconceptsMapping.reduce((prev, curr) => prev + curr.size, 0);
        const floatArray = new Float64Array(linksCount * 2);
        let index = 0;

        for (let startIndex = 0; startIndex < lattice.subconceptsMapping.length; startIndex++) {
            for (const endIndex of lattice.subconceptsMapping[startIndex]) {
                floatArray[index] = startIndex;
                floatArray[index + 1] = endIndex;
                index += 2;
            }
        }

        const message: ExportDiagramInitLinksRequest = {
            type: "init-links",
            links: floatArray.buffer,
        };

        worker.postMessage(message);
    }, [lattice]);

    useEffect(() => {
        if (!canvasDimensions) {
            return;
        }

        const message: ExportDiagramOptionsRequest = {
            type: "options",
            options: options,
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            centerX: canvasDimensions.centerX,
            centerY: canvasDimensions.centerY,
        };

        worker.postMessage(message);
    }, [canvasDimensions?.width, canvasDimensions?.height, canvasDimensions?.centerX, canvasDimensions?.centerY, options]);

*/

    return (
        <div
            ref={divRef}
            className={cn(props.className, "w-full h-full bg-surface grid items-center overflow-auto")}>
            <canvas
                ref={canvasRef}
                className="bg-white mx-auto"
                role="img"
                width={canvasDimensions?.width}
                height={canvasDimensions?.height} />
        </div>
    );
}

function useCanvasDimensions(
    layout: ConceptLatticeLayout | null,
    options: ExportDiagramOptions,
) {
    return useMemo(() => {
        if (!layout) {
            return null;
        }

        let minX = Number.MAX_SAFE_INTEGER;
        let maxX = Number.MIN_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        let maxY = Number.MIN_SAFE_INTEGER;

        for (const point of layout) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
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
    }, [layout, options.nodeRadius, options.scale]);
}

function drawDiagram(
    context: CanvasRenderingContext2D,
    layout: ConceptLatticeLayout,
    options: ExportDiagramOptions,
) {
    if (options === null) {
        return;
    }

    for (const point of layout) {
        const x = point.x * options.scale;
        const y = -point.y * options.scale;

        context.beginPath();
        context.arc(x, y, options.nodeRadius, 0, 2 * Math.PI);
        context.fill();
    }
}