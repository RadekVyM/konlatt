import { ExportDiagramCanvasWorkerRequest } from "../types/ExportDiagramCanvasWorkerRequest";
import { ExportDiagramOptions } from "../types/ExportDiagramOptions";
import { createPoint, Point } from "../types/Point";

let canvas: OffscreenCanvas | null = null;
let options: ExportDiagramOptions | null = null;
let width = 1920;
let height = 1080;
let centerX = 0;
let centerY = 0;
let nodesCount = 0;
let layout = new Array<Point>();
let links = new Float64Array();

self.onmessage = async (event: MessageEvent<ExportDiagramCanvasWorkerRequest>) => {
    switch (event.data.type) {
        case "init-canvas":
            canvas = event.data.canvas;
            break;
        case "init-layout":
            nodesCount = event.data.nodesCount;
            layout = new Array<Point>(nodesCount);
            const dataLayout = new Float64Array(event.data.layout);

            if (dataLayout.length / 3 !== nodesCount) {
                throw new Error("Invalid layout");
            }

            for (let i = 0; i < nodesCount; i++) {
                const start = i * 3;
                const x = dataLayout[start];
                const y = dataLayout[start + 1];
                const z = dataLayout[start + 2];
                layout[i] = createPoint(x, y, z);
            }
            break;
        case "init-links":
            links = new Float64Array(event.data.links);
            break;
        case "options":
            options = event.data.options;
            width = event.data.width;
            height = event.data.height;
            centerX = event.data.centerX;
            centerY = event.data.centerY;
            break;
    }
    draw();
};

function draw() {
    const context = canvas?.getContext("2d");

    if (!canvas ||
        !context ||
        nodesCount === 0 ||
        layout.length === 0 ||
        links.length === 0 ||
        options === null ||
        width === 0 ||
        height === 0
    ) {
        return;
    }

    console.log(canvas.width, canvas.height);

    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, canvas.width, canvas.height);

    console.log(canvas.width, canvas.height);
    context.save();
    context.translate(centerX, centerY);
    drawDiagram(context);
    context.restore();
}

function drawDiagram(context: OffscreenCanvasRenderingContext2D) {
    if (options === null) {
        return;
    }

    for (const point of layout) {
        const x = point[0] * options.scale;
        const y = point[1] * options.scale;

        context.beginPath();
        context.arc(x, y, options.nodeRadius, 0, 2 * Math.PI);
        context.fill();
    }
}