import { ConceptLatticeLabeling } from "./ConceptLatticeLabeling";
import { Relation } from "./Relation";

export type ConceptLattice = {
    readonly subconceptsRelation: Relation,
    readonly superconceptsRelation: Relation,
    readonly attributesLabeling: ConceptLatticeLabeling,
    readonly objectsLabeling: ConceptLatticeLabeling,
}