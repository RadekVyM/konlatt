import { ConceptLatticeLayout } from "../diagram/ConceptLatticeLayout";
import { DiagramOffsetMementos } from "../diagram/DiagramOffsetMementos";
import { Point } from "../Point";

export type ConceptLatticeLayoutCacheItem = {
    stateId: string,
    layout: ConceptLatticeLayout,
    diagramOffsets: ReadonlyArray<Point>,
    diagramOffsetMementos: DiagramOffsetMementos,
    createdAt: Date,
}