import { FormalContext, formalContextHasAttribute } from "../../types/FormalContext";

export function* generateRelations(context: FormalContext): Generator<[number, number], void, unknown>
 {
    for (let object = 0; object < context.objects.length; object++) {
        for (let attribute = 0; attribute < context.attributes.length; attribute++) {
            if (formalContextHasAttribute(context, object, attribute)) {
                yield [object, attribute];
            }
        }
    }
}