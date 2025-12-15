import { Rect } from "../Rect";

export type LabelGroup = {
    conceptIndex: number,
    labels: Array<LabelGroupLine>,
    placement: "top" | "bottom",
    relativeRect: Rect,
}

export type LabelGroupLine = { text: string, relativeRect: Rect }