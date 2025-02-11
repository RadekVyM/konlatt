export type FormalConcepts = ReadonlyArray<FormalConcept>

export type FormalConcept = {
    readonly index: number,
    readonly objects: ReadonlyArray<number>,
    readonly attributes: ReadonlyArray<number>,
}

export function getSupremum(concepts: FormalConcepts) {
    return concepts.reduce((prev, curr) => prev.objects.length < curr.objects.length ? curr : prev, concepts[0]);
}

export function getInfimum(concepts: FormalConcepts) {
    return concepts.reduce((prev, curr) => prev.attributes.length < curr.attributes.length ? curr : prev, concepts[0]);
}