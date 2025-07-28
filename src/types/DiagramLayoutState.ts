import { LayoutComputationOptions } from "./LayoutComputationOptions";

export type DiagramLayoutState = {
    displayHighlightedSublatticeOnly: boolean,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
} & LayoutComputationOptions