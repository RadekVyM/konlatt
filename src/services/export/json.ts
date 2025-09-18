import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { escapeJson } from "../../utils/string";
import { CollapseRegions } from "./CollapseRegions";
import { INDENTATION } from "./constants";
import { generateRelations } from "./utils";

export function pushArray<T extends {}>(
    lines: Array<string>,
    values: ReadonlyArray<T>,
    name: string | null,
    indentation: string,
    withComma: boolean,
    transformer: (value: T) => string,
    collapseRegions?: CollapseRegions,
) {
    const start = name ? `${indentation}"${name}": ` : `${indentation}`;
    const regionStart = collapseRegions?.nextRegionStart;

    if (values.length <= 5) {
        lines.push(`${start}[${values.map(transformer).join(", ")}]${withComma ? "," : ""}`);

        if (collapseRegions && regionStart !== undefined) {
            collapseRegions.nextRegionStart = regionStart + 1;
        }

        return;
    }

    lines.push(`${start}[`);

    for (let i = 0; i < values.length; i++) {
        lines.push(`${indentation}${INDENTATION}${transformer(values[i])}${i === values.length - 1 ? "" : ","}`);
    }

    lines.push(`${indentation}]${withComma ? "," : ""}`);

    if (collapseRegions && regionStart !== undefined) {
        const end = regionStart + 1 + values.length;

        collapseRegions.collapseRegions.set(regionStart, end);
        collapseRegions.nextRegionStart = end + 1;
    }
}

export function stringTransformer<T extends {}>(value: T) {
    return `"${value}"`;
}

export function escapedStringTransformer(value: string) {
    return `"${escapeJson(value)}"`;
}

export function defaultTransformer<T extends {}>(value: T) {
    return value.toString();
}

export function pushRelation(
    lines: Array<string>,
    context: FormalContext,
    indentation: string,
    withComma: boolean,
    collapseRegions?: CollapseRegions,
) {
    lines.push(`${indentation}"relation": [`);

    const regionStart = collapseRegions?.nextRegionStart;
    let relationsCount = 0;

    for (const [object, attribute] of generateRelations(context)) {
        lines.push(`${indentation}${INDENTATION}[${object}, ${attribute}],`);
        relationsCount++;
    }

    lines[lines.length - 1] = lines[lines.length - 1].slice(0, lines[lines.length - 1].length - 1);

    lines.push(`${indentation}]${withComma ? "," : ""}`);

    if (collapseRegions && regionStart !== undefined) {
        const end = regionStart + 1 + relationsCount;

        collapseRegions.collapseRegions.set(regionStart, end);
        collapseRegions.nextRegionStart = end + 1;
    }
}

export function pushConcepts(
    lines: Array<string>,
    formalConcepts: FormalConcepts,
    indentation: string,
    withComma: boolean,
    collapseRegions?: CollapseRegions,
) {
    const conceptIndentation = `${indentation}${INDENTATION}`;
    const regionStart = collapseRegions?.nextRegionStart;

    lines.push(`${indentation}"concepts": [`);

    const linesCountBeforeConcepts = lines.length;

    if (collapseRegions) {
        collapseRegions.nextRegionStart++;
    }

    for (let conceptIndex = 0; conceptIndex < formalConcepts.length; conceptIndex++) {
        const concept = formalConcepts[conceptIndex];
        pushConcept(lines, concept, conceptIndentation, conceptIndex !== formalConcepts.length - 1, undefined, collapseRegions);
    }

    const conceptsLinesCount = lines.length - linesCountBeforeConcepts;

    lines.push(`${indentation}]${withComma ? "," : ""}`);

    if (collapseRegions && regionStart !== undefined) {
        const end = regionStart + 1 + conceptsLinesCount;

        collapseRegions.collapseRegions.set(regionStart, end);
        collapseRegions.nextRegionStart = end + 1;
    }
}

export function pushConcept(
    lines: Array<string>,
    concept: FormalConcept,
    indentation: string,
    withComma: boolean,
    context?: FormalContext,
    collapseRegions?: CollapseRegions,
    isTop?: boolean,
) {
    const conceptBodyIndentation = `${indentation}${INDENTATION}`;
    const regionStart = collapseRegions?.nextRegionStart;

    lines.push(`${indentation}{`);

    const linesCountBeforeArrays = lines.length;

    if (collapseRegions) {
        collapseRegions.nextRegionStart++;
    }

    pushArray(lines, concept.objects, "objects", conceptBodyIndentation, true, context ? (object) => escapedStringTransformer(context.objects[object]) : defaultTransformer, collapseRegions);
    pushArray(lines, concept.attributes, "attributes", conceptBodyIndentation, false, context ? (attribute) => escapedStringTransformer(context.attributes[attribute]) : defaultTransformer, collapseRegions);

    const arraysLinesCount = lines.length - linesCountBeforeArrays;

    lines.push(`${indentation}}${!withComma ? "" : ","}`);

    if (!isTop && collapseRegions && regionStart !== undefined) {
        const end = regionStart + 1 + arraysLinesCount;

        collapseRegions.collapseRegions.set(regionStart, end);
        collapseRegions.nextRegionStart = end + 1;
    }
}