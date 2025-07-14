import { LayoutMethod } from "./LayoutMethod";

export type DiagramLayoutState = {
    layoutMethod: LayoutMethod,
    displayHighlightedSublatticeOnly: boolean,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
}