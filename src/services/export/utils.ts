import { FormalContext, formalContextHasAttribute } from "../../types/FormalContext";

export function* generateContextRelation(context: FormalContext): Generator<[number, number], void, unknown> {
    for (let object = 0; object < context.objects.length; object++) {
        for (let attribute = 0; attribute < context.attributes.length; attribute++) {
            if (formalContextHasAttribute(context, object, attribute)) {
                yield [object, attribute];
            }
        }
    }
}

export function* generateLatticeRelation(latticeRelation: ReadonlyArray<Set<number>>): Generator<[number, number], void, unknown> {
    for (let first = 0; first < latticeRelation.length; first++) {
        for (const second of latticeRelation[first]) {
            yield [first, second];
        }
    }
}