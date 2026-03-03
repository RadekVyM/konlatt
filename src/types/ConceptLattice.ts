import { ConceptLatticeLabeling } from "./ConceptLatticeLabeling";

export type ConceptLattice = {
    readonly subconceptsRelation: ReadonlyArray<Set<number>>,
    readonly superconceptsRelation: ReadonlyArray<Set<number>>,
    readonly attributesLabeling: ConceptLatticeLabeling,
    readonly objectsLabeling: ConceptLatticeLabeling,
}