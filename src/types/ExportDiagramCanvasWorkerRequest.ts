import { ExportDiagramOptions } from "./ExportDiagramOptions"

export type ExportDiagramCanvasWorkerRequest =
    ExportDiagramInitCanvasRequest |
    ExportDiagramInitLayoutRequest |
    ExportDiagramInitLinksRequest |
    ExportDiagramOptionsRequest

export type ExportDiagramInitCanvasRequest = {
    type: "init-canvas",
    canvas: OffscreenCanvas,
}

export type ExportDiagramInitLayoutRequest = {
    type: "init-layout",
    nodesCount: number,
    layout: ArrayBuffer,
}

export type ExportDiagramInitLinksRequest = {
    type: "init-links",
    links: ArrayBuffer,
}

export type ExportDiagramOptionsRequest = {
    type: "options",
    options: ExportDiagramOptions,
    width: number,
    height: number,
    centerX: number,
    centerY: number,
}