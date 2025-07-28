import { LayoutMethod } from "./LayoutMethod";

export type LayoutComputationOptions = {
    layoutMethod: LayoutMethod,
    targetDimensionReDraw: 2 | 3,
    parallelizeReDraw: boolean,
}