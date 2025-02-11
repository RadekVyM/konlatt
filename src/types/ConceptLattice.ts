export type ConceptLattice = {
    readonly subconceptsMapping: ReadonlyArray<Set<number>>,
    readonly superconceptsMapping: ReadonlyArray<Set<number>>,
}