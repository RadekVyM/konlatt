export type ConceptPoint = {
    x: number,
    y: number,
    z: number,
    conceptIndex: number,
}

export function createConceptPoint(
    x: number,
    y: number,
    z: number,
    conceptIndex: number,
): ConceptPoint {
    return {
        x,
        y,
        z,
        conceptIndex,
    };
}