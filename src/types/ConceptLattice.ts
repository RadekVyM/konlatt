import { ConceptLatticeLabeling } from "./ConceptLatticeLabeling";

export type ConceptLattice = {
    readonly subconceptsRelation: ReadonlyArray<ReadonlySet<number>>,
    readonly superconceptsRelation: ReadonlyArray<ReadonlySet<number>>,
    readonly attributesLabeling: ConceptLatticeLabeling,
    readonly objectsLabeling: ConceptLatticeLabeling,
}