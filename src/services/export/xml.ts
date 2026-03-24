import { FormalConcept, FormalConcepts } from "../../types/FormalConcepts";
import { FormalContext } from "../../types/FormalContext";
import { escapeXml } from "../../utils/string";
import { CollapseRegions } from "./CollapseRegions";
import { INDENTATION } from "./constants";

/**
 * Pushes a collection of values into the lines array as a formatted XML element block.
 * Handles indentation, empty elements (self-closing), and optional region tracking for UI collapsing.
 */
export function pushArray<T extends {}>(
    lines: Array<string>,
    values: ReadonlyArray<T>,
    outerElementName: string,
    innnerElementName: string,
    indentation: string,
    transformer: (value: T, elementName: string) => string,
    collapseRegions?: CollapseRegions,
) {
    const regionStart = collapseRegions?.nextRegionStart;

    if (values.length == 0) {
        lines.push(`${indentation}<${outerElementName} />`);

        if (collapseRegions && regionStart !== undefined) {
            collapseRegions.nextRegionStart = regionStart + 1;
        }

        return;
    }

    lines.push(`${indentation}<${outerElementName}>`);

    for (let i = 0; i < values.length; i++) {
        lines.push(`${indentation}${INDENTATION}${transformer(values[i], innnerElementName)}`);
    }

    lines.push(`${indentation}</${outerElementName}>`);

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

/**
 * Iterates through a collection of formal concepts and pushes their XML representation 
 * into the lines array, wrapped in a `<concepts>` tag.
 */
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

/**
 * Serializes a single `FormalConcept` into XML. 
 * If a `FormalContext` is provided, indexes are resolved to their escaped string labels.
 */
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
        "objects",
        "obj",
        conceptBodyIndentation,
        context ?
            (object, elementName) => escapedBodyValueTransformer(context.objects[object], elementName) :
            bodyValueTransformer,
        collapseRegions);
    pushArray(
        lines,
        concept.attributes,
        "attributes",
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

/**
 * Pushes the standard UTF-8 XML declaration to the start of the lines array.
 */
export function pushXmlDeclaration(lines: Array<string>, collapseRegions?: CollapseRegions) {
    if (collapseRegions) {
        collapseRegions.nextRegionStart++;
    }

    lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
}