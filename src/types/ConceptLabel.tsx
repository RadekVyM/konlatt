import { Point } from "./Point";

export type ConceptLabel = {
    id: string,
    text: string,
    position?: Point,
    conceptIndex: number,
    placement: "top" | "bottom",
}

export type PositionedConceptLabel = ConceptLabel & {
    position: Point,
}