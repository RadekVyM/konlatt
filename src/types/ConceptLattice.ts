import { ConceptLatticeLabeling } from "./ConceptLatticeLabeling";

export type ConceptLattice = {
    readonly subconceptsMapping: ReadonlyArray<Set<number>>,
    readonly superconceptsMapping: ReadonlyArray<Set<number>>,
    readonly attributesLabeling: ConceptLatticeLabeling,
    readonly objectsLabeling: ConceptLatticeLabeling,
}