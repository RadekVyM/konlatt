import { Rect } from "../types/Rect";
import { DiagramCanvasWorkerRequest } from "../types/workers/DiagramCanvasWorkerRequest";
import { crossesRect, isInRect } from "../utils/rect";

const LAYOUT_SCALE = 60;
const GRID_LINE_STEP = LAYOUT_SCALE;
const GRID_LINE_STEP_HALF = GRID_LINE_STEP / 2;
const GRID_LINE_GAP = LAYOUT_SCALE / 16;
const GRID_LINE_GAP_HALF = GRID_LINE_GAP / 2;
const GRID_LINES_INVISIBLE_THRESHOLD = 20;
const NODE_RADIUS = 5;

let canvas: OffscreenCanvas | null = null;
let scale = 1;
let devicePixelRatio = 1;
let translateX = 0;
let translateY = 0;
let width = 0;
let height = 0;
let isEditable = false;
let selectedIndex: number | null = null;
let hoveredIndex: number | null = null;
let nodesCount = 0;
let layout = new Float64Array();
let links = new Float64Array();

self.onmessage = async (event: MessageEvent<DiagramCanvasWorkerRequest>) => {
    switch (event.data.type) {
        case "init-canvas":
            canvas = event.data.canvas;
            break;
        case "init-layout":
            nodesCount = event.data.nodesCount;
            layout = new Float64Array(event.data.layout);
            
            if (layout.length / 3 !== nodesCount) {
                throw new Error("Invalid layout");
            }
            break;
        case "init-links":
            links = new Float64Array(event.data.links);
            break;
        case "transform":
            scale = event.data.scale;
            translateX = event.data.translateX;
            translateY = event.data.translateY;
            devicePixelRatio = event.data.devicePixelRatio;
            break;
        case "dimensions":
            width = event.data.width;
            height = event.data.height;
            break;
        case "interaction":
            selectedIndex = event.data.selectedIndex;
            hoveredIndex = event.data.hoveredIndex;
            isEditable = event.data.isEditable;
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
        width === 0 ||
        height === 0
    ) {
        return;
    }

    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const finalScale = scale * devicePixelRatio;

    context.save();
    context.translate(translateX * devicePixelRatio, translateY * devicePixelRatio);
    context.scale(finalScale, finalScale);
    if (isEditable) {
        drawGrid(context);
    }
    drawDiagram(context);
    context.restore();
}

function drawGrid(context: OffscreenCanvasRenderingContext2D) {
    const drawnWidth = width * devicePixelRatio;
    const drawnHeight = height * devicePixelRatio;
    const outlineColor = "gray";
    const centerX = drawnWidth / 2;
    const centerY = drawnHeight / 2;

    const left = -translateX / scale;
    const top = -translateY / scale;
    const right = left + (drawnWidth / scale);
    const bottom = top + (drawnHeight / scale);
    const startX = left + ((centerX - left) % GRID_LINE_STEP);
    const startY = top + ((centerY - top) % GRID_LINE_STEP);

    if (GRID_LINE_STEP_HALF * scale > GRID_LINES_INVISIBLE_THRESHOLD) {
        context.beginPath();
        for (let x = startX - GRID_LINE_STEP_HALF; x < right; x += GRID_LINE_STEP) {
            context.moveTo(x, startY - GRID_LINE_STEP + GRID_LINE_GAP_HALF);
            context.lineTo(x, bottom);
        }
        for (let y = startY - GRID_LINE_STEP_HALF; y < bottom; y += GRID_LINE_STEP) {
            context.moveTo(startX - GRID_LINE_STEP + GRID_LINE_GAP_HALF, y);
            context.lineTo(right, y);
        }
        context.strokeStyle = outlineColor;
        context.setLineDash([GRID_LINE_GAP, GRID_LINE_GAP]);
        context.stroke();
    }

    context.beginPath();
    for (let x = startX - GRID_LINE_STEP; x < right; x += GRID_LINE_STEP) {
        context.moveTo(x, top);
        context.lineTo(x, bottom);
    }
    for (let y = startY - GRID_LINE_STEP; y < bottom; y += GRID_LINE_STEP) {
        context.moveTo(left, y);
        context.lineTo(right, y);
    }
    context.strokeStyle = outlineColor;
    context.setLineDash([]);
    context.stroke();
}

function drawDiagram(context: OffscreenCanvasRenderingContext2D) {
    const targetPoints = getTargetPoints();
    const visibleRect = getVisibleRect(width, height);

    const onSurfaceColor = "black";
    const primaryColor = "red";
    const outlineColor = "gray";

    context.strokeStyle = outlineColor;

    // It looks like a little batching of the lines to a single path is helpful only when zoomed out
    // However, it is much worse when zoomed in
    // I have no clue why...
    const linesCountInBatch = 1;
    let linesCount = 0;
    context.beginPath();

    for (let i = 0; i < links.length; i += 2) {
        const startIndex = links[i];
        const endIndex = links[i + 1];

        const [startX, startY, normalStartX, normalStartY] = targetPoints[startIndex];
        const [endX, endY, normalEndX, normalEndY] = targetPoints[endIndex];

        if (!crossesRect(normalStartX, normalStartY, normalEndX, normalEndY, visibleRect)) {
            continue;
        }

        if (linesCount !== 0 && linesCount % linesCountInBatch === 0) {
            context.stroke();
            context.beginPath();
        }

        context.moveTo(startX, startY);
        context.lineTo(endX, endY);

        linesCount++;
    }

    context.stroke();

    // TODO: try to use this for nodes: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#pre-render_similar_primitives_or_repeating_objects_on_an_offscreen_canvas

    context.fillStyle = onSurfaceColor;

    for (let i = 0; i < targetPoints.length; i++) {
        if (i === selectedIndex || i === hoveredIndex) {
            continue;
        }

        const [x, y, normalX, normalY] = targetPoints[i];

        if (!isInRect(normalX, normalY, visibleRect)) {
            continue;
        }

        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
        context.fill();
    }

    if (hoveredIndex !== null) {
        const [x, y] = targetPoints[hoveredIndex];

        context.beginPath();
        context.fillStyle = primaryColor;
        context.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
        context.fill();
    }

    if (selectedIndex !== null && selectedIndex !== hoveredIndex) {
        const [x, y] = targetPoints[selectedIndex];

        context.beginPath();
        context.arc(x, y, NODE_RADIUS, 0, 2 * Math.PI);
        context.fillStyle = primaryColor;
        context.fill();
    }

    context.font = "6px Gabarito";
    context.fillStyle = onSurfaceColor;

    /*
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

            context.fillText(label, x, y + 7);
        }

        if (attributeLabels) {
            context.textAlign = "center";
            context.textBaseline = "alphabetic";
            const label = attributeLabels.map((l) => formalContext.attributes[l]).join(", ").substring(0, 50);

            context.fillText(label, x, y - 7);
        }
    }
    */
}

function getTargetPoints(): Array<[number, number, number, number]> {
    const targetPoints = new Array<[number, number, number, number]>(layout.length / 3);

    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < targetPoints.length; i++) {
        const layoutX = layout[i * 3];
        const layoutY = layout[(i * 3) + 1];

        const normalX = layoutX;
        const normalY = layoutY;
        const x = (normalX * LAYOUT_SCALE) + centerX;
        const y = (normalY * LAYOUT_SCALE) + centerY;

        targetPoints[i] = [Math.round(x), Math.round(y), normalX, normalY];
    }

    return targetPoints;
}

function getVisibleRect(canvasWidth: number, canvasHeight: number): Rect {
    const nodeSizeAddition = (NODE_RADIUS) / LAYOUT_SCALE;
    const left = (translateX / scale) / LAYOUT_SCALE;
    const top = (translateY / scale) / LAYOUT_SCALE;
    const width = (canvasWidth / scale) / LAYOUT_SCALE;
    const height = (canvasHeight / scale) / LAYOUT_SCALE;
    const halfFactor = 2 / scale;

    return {
        x: -(width / halfFactor) - left - nodeSizeAddition,
        y: -(height / halfFactor) - top - nodeSizeAddition,
        width: width + (2 * nodeSizeAddition),
        height: height + (2 * nodeSizeAddition),
    };
}