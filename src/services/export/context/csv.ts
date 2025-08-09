import { FormalContext } from "../../../types/FormalContext";
import { generateRelations } from "../utils";

export function convertToCsv(context: FormalContext, separator: string = ",") {
    const lines = new Array<string>();

    for (const [object, attribute] of generateRelations(context)) {
        lines.push(`${context.objects[object]}${separator}${context.attributes[attribute]}`);
    }

    return lines;
}