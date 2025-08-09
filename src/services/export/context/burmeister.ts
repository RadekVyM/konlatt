import { FormalContext, formalContextHasAttribute } from "../../../types/FormalContext";

export function convertToBurmeister(name: string, context: FormalContext) {
    const lines = new Array<string>();

    lines.push("B");
    lines.push(name);
    lines.push(context.objects.length.toString());
    lines.push(context.attributes.length.toString());
    lines.push("");

    for (const object of context.objects) {
        lines.push(object);
    }
    for (const attribute of context.attributes) {
        lines.push(attribute);
    }

    for (let object = 0; object < context.objects.length; object++) {
        const line = new Array<string>();

        for (let attribute = 0; attribute < context.attributes.length; attribute++) {
            line.push(formalContextHasAttribute(context, object, attribute) ?
                "X" :
                ".");
        }

        lines.push(line.join(""));
    }

    return lines;
}