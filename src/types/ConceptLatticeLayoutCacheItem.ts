import { ConceptLatticeLayout } from "./ConceptLatticeLayout";
import { DiagramOffsetMementos } from "./diagram/DiagramOffsetMementos";
import { Point } from "./Point";

export type ConceptLatticeLayoutCacheItem = {
    stateId: string,
    layout: ConceptLatticeLayout,
    diagramOffsets: Array<Point>,
    diagramOffsetMementos: DiagramOffsetMementos,
    createdAt: Date,
}