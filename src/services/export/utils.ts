import { FormalContext, formalContextHasAttribute } from "../../types/FormalContext";
import { Relation } from "../../types/Relation";

/**
 * Iterates over a `FormalContext` and yields pairs of indexes representing 
 * the incidence relation between objects and attributes.
 */
export function* generateContextRelation(context: FormalContext): Generator<[number, number], void, unknown> {
    for (let object = 0; object < context.objects.length; object++) {
        for (let attribute = 0; attribute < context.attributes.length; attribute++) {
            if (formalContextHasAttribute(context, object, attribute)) {
                yield [object, attribute];
            }
        }
    }
}

/**
 * Flattens a lattice relation (represented as an adjacency list) into a stream 
 * of individual directed edge pairs.
 */
export function* generateLatticeRelation(latticeRelation: Relation): Generator<[number, number], void, unknown> {
    for (let first = 0; first < latticeRelation.length; first++) {
        for (const second of latticeRelation[first]) {
            yield [first, second];
        }
    }
}