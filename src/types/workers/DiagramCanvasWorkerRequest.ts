export type DiagramCanvasWorkerRequest = InitCanvasRequest | InitLayoutRequest | InitLinksRequest | TransformRequest | DimensionsRequest | InteractionRequest

export type InitCanvasRequest = {
    type: "init-canvas",
    canvas: OffscreenCanvas,
}

export type InitLayoutRequest = {
    type: "init-layout",
    nodesCount: number,
    layout: ArrayBuffer,
}

export type InitLinksRequest = {
    type: "init-links",
    links: ArrayBuffer,
}

export type TransformRequest = {
    type: "transform",
    scale: number,
    translateX: number,
    translateY: number,
    devicePixelRatio: number,
}

export type DimensionsRequest = {
    type: "dimensions",
    width: number,
    height: number,
}

export type InteractionRequest = {
    type: "interaction",
    selectedIndex: number | null,
    hoveredIndex: number | null,
    isEditable: boolean,
}