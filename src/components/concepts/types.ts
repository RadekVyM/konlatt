export type ConceptDetailWithControlsProps = {
    type: "with-controls",
    visibleConceptIndexes: Set<number> | null,
    upperConeOnlyConceptIndex: number | null,
    lowerConeOnlyConceptIndex: number | null,
    setUpperConeOnlyConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
    setLowerConeOnlyConceptIndex: React.Dispatch<React.SetStateAction<number | null>>,
}

export type ConceptDetailWithoutControlsProps = {
    type: "without-controls",
}