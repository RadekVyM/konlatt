import { Font } from "../export/Font";
import { LabelGroup } from "../export/LabelGroup";
import { TextBackgroundType } from "../export/TextBackgroundType";

export type ExportDiagramWorkerRequest = InitCanvasRequest |
    InitLayoutRequest |
    InitLinksRequest |
    DimensionsRequest |
    AppearanceRequest |
    LabelGroupsRequest |
    LabelsAppearanceRequest |
    BlobRequest

export type InitCanvasRequest = {
    type: "init-canvas",
    canvas: OffscreenCanvas,
}

export type InitLayoutRequest = {
    type: "init-layout",
    layout: ArrayBuffer,
}

export type InitLinksRequest = {
    type: "init-links",
    links: ArrayBuffer,
}

export type DimensionsRequest = {
    type: "dimensions",
    width: number,
    height: number,
    scale: number,
    centerX: number,
    centerY: number,
}

export type AppearanceRequest = {
    type: "appearance",
    backgroundColorHexa: string,
    defaultNodeColorHexa: string,
    defaultLinkColorHexa: string,
    nodeRadius: number,
    linkThickness: number,
}

export type LabelGroupsRequest = {
    type: "label-groups",
    labelGroups: Array<LabelGroup>,
}

export type LabelsAppearanceRequest = {
    type: "labels-appearance",
    textColorHexa: string,
    textBackgroundColorHexa: string,
    textOutlineColorHexa: string,
    textBackgroundType: TextBackgroundType,
    textSize: number,
    font: Font,
}

export type BlobRequest = {
    type: "blob",
    mimeType: string,
}