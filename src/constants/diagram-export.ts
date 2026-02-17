import { DiagramExportDimensionsTemplate } from "../types/export/DiagramExportDimensionsTemplate";

// https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
export const MAX_CANVAS_HEIGHT = 32767;
export const MAX_CANVAS_WIDTH = 32767;
export const MAX_CANVAS_AREA = 16384 * 16384;

export const CANVAS_ID = "export-diagram-canvas";

// 300 DPI
export const EXPORT_DIMENSIONS_TEMPLATES: ReadonlyArray<DiagramExportDimensionsTemplate> = [
    {
        key: "a0",
        title: "A0",
        largerSize: 14043,
        smallerSize: 9933,
    },
    {
        key: "a1",
        title: "A1",
        largerSize: 9933,
        smallerSize: 7016,
    },
    {
        key: "a2",
        title: "A2",
        largerSize: 7016,
        smallerSize: 4961,
    },
    {
        key: "a3",
        title: "A3",
        largerSize: 4961,
        smallerSize: 3508,
    },
    {
        key: "a4",
        title: "A4",
        largerSize: 3508,
        smallerSize: 2480,
    },
    {
        key: "a5",
        title: "A5",
        largerSize: 2480,
        smallerSize: 1748,
    },
    {
        key: "a6",
        title: "A6",
        largerSize: 1748,
        smallerSize: 1240,
    },
    {
        key: "hd",
        title: "HD",
        largerSize: 1280,
        smallerSize: 720,
    },
    {
        key: "fullhd",
        title: "Full HD",
        largerSize: 1920,
        smallerSize: 1080,
    },
    {
        key: "quadhd",
        title: "Quad HD",
        largerSize: 2560,
        smallerSize: 1440,
    },
    {
        key: "4kultrahd",
        title: "4K Ultra HD",
        largerSize: 3840,
        smallerSize: 2160,
    },
    {
        key: "8kultrahd",
        title: "8K Ultra HD",
        largerSize: 7680,
        smallerSize: 4320,
    },
];