import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { escapeXml } from "../../utils/string";
import { CollapseRegions } from "./CollapseRegions";
import { INDENTATION } from "./constants";

export function pushArray<T extends {}>(
    lines: Array<string>,
    values: ReadonlyArray<T>,
    elementName: string,
    indentation: string,
    transformer: (value: T, elementName: string) => string,
    collapseRegions?: CollapseRegions,
) {
    const regionStart = collapseRegions?.nextRegionStart;

    if (values.length == 0) {
        lines.push(`${indentation}<${elementName}s />`);

        if (collapseRegions && regionStart !== undefined) {
            collapseRegions.nextRegionStart = regionStart + 1;
        }

        return;
    }

    lines.push(`${indentation}<${elementName}s>`);

    for (let i = 0; i < values.length; i++) {
        lines.push(`${indentation}${INDENTATION}${transformer(values[i], elementName)}`);
    }

    lines.push(`${indentation}</${elementName}s>`);

    if (collapseRegions && regionStart !== undefined) {
        const end = regionStart + 1 + values.length;

        collapseRegions.collapseRegions.set(regionStart, end);
        collapseRegions.nextRegionStart = end + 1;
    }
}

export function bodyValueTransformer<T extends {}>(value: T, elementName: string) {
    return `<${elementName}>${value}</${elementName}>`;
}

export function escapedBodyValueTransformer(value: string, elementName: string) {
    return `<${elementName}>${escapeXml(value)}</${elementName}>`;
}

export function pushConcepts(
    lines: Array<string>,
    formalConcepts: FormalConcepts,
    indentation: string,
    collapseRegions?: CollapseRegions,
) {
    const conceptIndentation = `${indentation}${INDENTATION}`;
    const regionStart = collapseRegions?.nextRegionStart;

    lines.push(`${indentation}<concepts>`);

    const linesCountBeforeConcepts = lines.length;

    if (collapseRegions) {
        collapseRegions.nextRegionStart++;
    }

    for (let conceptIndex = 0; conceptIndex < formalConcepts.length; conceptIndex++) {
        const concept = formalConcepts[conceptIndex];
        pushConcept(lines, concept, conceptIndentation, undefined, collapseRegions);
    }

    const conceptsLinesCount = lines.length - linesCountBeforeConcepts;

    lines.push(`${indentation}</concepts>`);

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
    context?: FormalContext,
    collapseRegions?: CollapseRegions,
    isTop?: boolean,
) {
    const conceptBodyIndentation = `${indentation}${INDENTATION}`;
    const regionStart = collapseRegions?.nextRegionStart;

    lines.push(`${indentation}<concept>`);

    const linesCountBeforeArrays = lines.length;

    if (collapseRegions) {
        collapseRegions.nextRegionStart++;
    }

    pushArray(
        lines,
        concept.objects,
        "obj",
        conceptBodyIndentation,
        context ?
            (object, elementName) => escapedBodyValueTransformer(context.objects[object], elementName) :
            bodyValueTransformer,
        collapseRegions);
    pushArray(
        lines,
        concept.attributes,
        "attr",
        conceptBodyIndentation,
        context ?
            (attribute, elementName) => escapedBodyValueTransformer(context.attributes[attribute], elementName) :
            bodyValueTransformer,
        collapseRegions);

    const arraysLinesCount = lines.length - linesCountBeforeArrays;

    lines.push(`${indentation}</concept>`);

    if (!isTop && collapseRegions && regionStart !== undefined) {
        const end = regionStart + 1 + arraysLinesCount;

        collapseRegions.collapseRegions.set(regionStart, end);
        collapseRegions.nextRegionStart = end + 1;
    }
}