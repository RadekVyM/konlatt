import { FormalContext } from "../../../types/FormalContext";
import { createCollapseRegions } from "../CollapseRegions";
import { generateRelations } from "../utils";

export function convertToCsv(context: FormalContext, separator: string = ",") {
    const lines = new Array<string>();
    const collapseRegions = createCollapseRegions();

    let lastObject: number | null = null;
    let count = 0;

    for (const [object, attribute] of generateRelations(context)) {
        if (lastObject !== null && lastObject !== object) {
            const end = collapseRegions.nextRegionStart + count;
            if (end - 1 > collapseRegions.nextRegionStart) {
                collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, end);
            }
            collapseRegions.nextRegionStart += count;
            count = 0;
        }

        count++;
        lastObject = object;

        lines.push(`${context.objects[object]}${separator}${context.attributes[attribute]}`);
    }

    const end = collapseRegions.nextRegionStart + count;
    if (end - 1 > collapseRegions.nextRegionStart) {
        collapseRegions.collapseRegions.set(collapseRegions.nextRegionStart, end);
    }

    return { lines, collapseRegions: collapseRegions.collapseRegions };
}