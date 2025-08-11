import { FormalContext, formalContextHasAttribute } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";

export function convertToBurmeister(name: string, context: FormalContext) {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    lines.push("B");
    lines.push(name);
    lines.push(context.objects.length.toString());
    lines.push(context.attributes.length.toString());
    lines.push("");

    collapseRegions.nextRegionStart = 5;

    for (const object of context.objects) {
        lines.push(object);
    }
    for (const attribute of context.attributes) {
        lines.push(attribute);
    }

    collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + context.objects.length);
    collapseRegions.nextRegionStart += context.objects.length;
    collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + context.attributes.length);
    collapseRegions.nextRegionStart += context.attributes.length;

    for (let object = 0; object < context.objects.length; object++) {
        const line = new Array<string>();

        for (let attribute = 0; attribute < context.attributes.length; attribute++) {
            line.push(formalContextHasAttribute(context, object, attribute) ?
                "X" :
                ".");
        }

        lines.push(line.join(""));
    }

    collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, collapseRegions.nextRegionStart + context.objects.length);

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}