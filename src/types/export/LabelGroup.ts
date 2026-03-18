import { Rect } from "../Rect";

export type LabelGroup = {
    layoutIndex: number,
    labels: ReadonlyArray<LabelGroupLine>,
    placement: "top" | "bottom",
    relativeRect: Rect,
}

export type LabelGroupLine = { text: string, relativeRect: Rect }