import { Font } from "../types/export/Font";
import { LabelGroup } from "../types/export/LabelGroup";
import { TextBackgroundType } from "../types/export/TextBackgroundType";
import { DiagramExportWorkerRequest } from "../types/workers/DiagramExportWorkerRequest";
import { drawLabels } from "../utils/drawing";

const LAYOUT_ENTRIES_COUNT = 2;
const LINKS_ENTRIES_COUNT = 2;
const DEBOUNCE_DELAY = 200;

let canvas: OffscreenCanvas | null = null;
let width = 0;
let height = 0;
let scale = 1;
let centerX = 0;
let centerY = 0;
let nodeRadius = 8;
let linkThickness = 2;
let backgroundColorHexa = "";
let defaultNodeColorHexa = "";
let defaultLinkColorHexa = "";

let labelGroups: Array<LabelGroup> | null = null;
let textSize = 10;
let font: Font | null = null;
let textBackgroundType: TextBackgroundType | null = null;
let textColorHexa = "";
let textBackgroundColorHexa = "";
let textOutlineColorHexa = "";

let layout: Float64Array | null = null;
let links: Float64Array | null = null;

let timeout: number | null = null;

self.onmessage = async (event: MessageEvent<DiagramExportWorkerRequest>) => {
    switch (event.data.type) {
        case "init-canvas":
            canvas = event.data.canvas;
            break;
        case "init-layout":
            labelGroups = null;
            layout = new Float64Array(event.data.layout);
            break;
        case "init-links":
            links = new Float64Array(event.data.links);
            break;
        case "dimensions":
            width = event.data.width;
            height = event.data.height;
            scale = event.data.scale;
            centerX = event.data.centerX;
            centerY = event.data.centerY;
            break;
        case "label-groups":
            labelGroups = event.data.labelGroups;
            break;
        case "appearance":
            nodeRadius = event.data.nodeRadius;
            linkThickness = event.data.linkThickness;
            backgroundColorHexa = event.data.backgroundColorHexa;
            defaultNodeColorHexa = event.data.defaultNodeColorHexa;
            defaultLinkColorHexa = event.data.defaultLinkColorHexa;
            break;
        case "labels-appearance":
            textColorHexa = event.data.textColorHexa;
            textBackgroundColorHexa = event.data.textBackgroundColorHexa;
            textOutlineColorHexa = event.data.textOutlineColorHexa;
            textSize = event.data.textSize;
            font = event.data.font;
            textBackgroundType = event.data.textBackgroundType;
            break;
    }

    if (timeout !== null) {
        clearTimeout(timeout);
    }

    timeout = setTimeout(draw, DEBOUNCE_DELAY);
}

function draw() {
    const context = canvas?.getContext("2d");

    if (!canvas ||
        !context ||
        layout == null ||
        links == null ||
        layout.length === 0 ||
        width === 0 ||
        height === 0 ||
        labelGroups == null ||
        textBackgroundType == null ||
        font == null
    ) {
        return;
    }

    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    drawBackground(context);
    context.translate(centerX, centerY);
    drawLinks(context);
    drawNodes(context);
    drawLabelGroups(context);
    context.restore();
}

function drawBackground(context: OffscreenCanvasRenderingContext2D) {
    context.save();
    context.fillStyle = backgroundColorHexa;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
}

function drawNodes(context: OffscreenCanvasRenderingContext2D) {
    if (!layout) {
        return;
    }

    context.save();
    context.fillStyle = defaultNodeColorHexa;

    for (let i = 0; i < layout.length; i += LAYOUT_ENTRIES_COUNT) {
        const pointX = layout[i];
        const pointY = layout[i + 1];
        const x = pointX * scale;
        const y = -pointY * scale;

        context.beginPath();
        context.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        context.fill();
    }

    context.restore();
}

function drawLinks(context: OffscreenCanvasRenderingContext2D) {
    if (!layout || !links) {
        return;
    }

    context.save();
    context.lineWidth = linkThickness;
    context.strokeStyle = defaultLinkColorHexa;

    for (let i = 0; i < links.length; i += LINKS_ENTRIES_COUNT) {
        const fromIndex = links[i] * LAYOUT_ENTRIES_COUNT;
        const toIndex = links[i + 1] * LAYOUT_ENTRIES_COUNT;
        const fromX = layout[(fromIndex)] * scale;
        const fromY = layout[fromIndex + 1] * scale;
        const toX = layout[toIndex] * scale;
        const toY = layout[toIndex + 1] * scale;

        context.beginPath();
        context.moveTo(fromX, -fromY);
        context.lineTo(toX, -toY);
        context.stroke();
    }

    context.restore();
}

function drawLabelGroups(context: OffscreenCanvasRenderingContext2D) {
    if (labelGroups === null ||
        layout === null ||
        !font ||
        !textBackgroundType) {
        return;
    }

    const capturedLayout = layout;

    drawLabels(
        context,
        labelGroups,
        font,
        textBackgroundType,
        textSize,
        textColorHexa,
        textBackgroundColorHexa,
        textOutlineColorHexa,
        (layoutIndex) => {
            if (layoutIndex * LAYOUT_ENTRIES_COUNT >= capturedLayout.length) {
                console.error(`Layout index of the label group should not be ${layoutIndex}`);
                return null;
            }

            const index = layoutIndex * LAYOUT_ENTRIES_COUNT;
            return [capturedLayout[index] * scale, capturedLayout[index + 1] * scale];
        });
}