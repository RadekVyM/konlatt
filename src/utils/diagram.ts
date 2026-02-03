import { getPoint } from "../components/concepts/diagram/utils";
import { CameraType } from "../types/CameraType";
import { ConceptLabel, PositionedConceptLabel } from "../types/ConceptLabel";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { LabelOptions } from "../types/LabelOptions";
import { Link } from "../types/Link";
import { createPoint, Point } from "../types/Point";
import { transformedPoint } from "./layout";

export function getLinks(
    concepts: Array<{ conceptIndex: number }> | null,
    subconceptsMapping: ReadonlyArray<Set<number>> | null,
    visibleConceptIndexes: Set<number> | null,
    filteredConceptIndexes: Set<number> | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const links = new Array<Link>();
    const noInvisibleConcepts = !visibleConceptIndexes || visibleConceptIndexes.size === 0;

    if (!concepts || !subconceptsMapping) {
        return links;
    }

    let i = 0;

    for (const concept of concepts) {
        for (const subconceptIndex of subconceptsMapping[concept.conceptIndex]) {
            const isNotVisible = visibleConceptIndexes && !visibleConceptIndexes.has(subconceptIndex);

            if (displayHighlightedSublatticeOnly && isNotVisible) {
                continue;
            }

            const isVisible = !!visibleConceptIndexes && visibleConceptIndexes.has(concept.conceptIndex) && visibleConceptIndexes.has(subconceptIndex);
            const isFiltered = !!filteredConceptIndexes && filteredConceptIndexes.has(concept.conceptIndex) && filteredConceptIndexes.has(subconceptIndex);

            const finalIsVisible = noInvisibleConcepts ? isFiltered : isVisible && (!displayHighlightedSublatticeOnly || isFiltered);

            links.push({
                conceptIndex: concept.conceptIndex,
                subconceptIndex,
                linkId: i,
                isVisible: finalIsVisible,
                isHighlighted: finalIsVisible,
            });
            i++;
        }
    }

    return links;
}

export function createLabels(
    idPrefix: string,
    itemLabels: ReadonlyArray<string> | undefined,
    latticeLabeling: ConceptLatticeLabeling | null,
    placement: "top" | "bottom",
    options?: LabelOptions,
) {
    const newLabels = new Array<ConceptLabel>();

    if (!itemLabels || !latticeLabeling) {
        return newLabels;
    }

    for (const [conceptIndex, labelIndexes] of latticeLabeling) {
        if (labelIndexes.length === 0) {
            continue;
        }

        const text = createLabelText(labelIndexes, itemLabels, options);

        newLabels.push({
            id: `${idPrefix}-${conceptIndex}`,
            text,
            conceptIndex,
            placement,
        });
    }

    return newLabels;
}

export function createLabelsWithPositions(
    idPrefix: string,
    itemLabels: ReadonlyArray<string> | undefined,
    latticeLabeling: ConceptLatticeLabeling | null,
    layout: ConceptLatticeLayout | null,
    conceptToLayoutIndexesMapping: Map<number, number>,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    diagramOffsets: Array<Point> | null,
    placement: "top" | "bottom",
    options?: LabelOptions,
) {
    const labels = createLabels(idPrefix, itemLabels, latticeLabeling, placement, options);
    const newLabels = new Array<PositionedConceptLabel>();
    const zOffset = cameraType === "2d" ? 0.002 : 0;

    if (!layout || !diagramOffsets || conceptToLayoutIndexesMapping.size !== layout.length) {
        return [];
    }

    for (const label of labels) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(label.conceptIndex);

        if (layoutIndex === undefined || layoutIndex >= layout.length) {
            continue;
        }

        const layoutPoint = layout[layoutIndex];

        const position = transformedPoint(
            createPoint(layoutPoint.x, layoutPoint.y, layoutPoint.z),
            getPoint(diagramOffsets, layoutIndex),
            [0, 0, 0],
            horizontalScale,
            verticalScale,
            rotationDegrees,
            cameraType,
            zOffset);

        newLabels.push({
            ...label,
            position,
        });
    }

    return newLabels;
}

export function sortedLabelsByPosition(labels: Array<ConceptLabel>, layout: Array<Point>, conceptToLayoutIndexesMapping: Map<number, number>) {
    labels = [...labels];

    labels.sort((a, b) => {
        const aLayoutIndex = conceptToLayoutIndexesMapping.get(a.conceptIndex);
        const bLayoutIndex = conceptToLayoutIndexesMapping.get(b.conceptIndex);

        if (aLayoutIndex === undefined || bLayoutIndex === undefined) {
            console.error(`One of the layout indexes should not be: ${aLayoutIndex} or ${bLayoutIndex}`);
            return 0;
        }

        const aPoint = layout[aLayoutIndex];
        const bPoint = layout[bLayoutIndex];

        const diff = aPoint[1] - bPoint[1];

        if (diff === 0) {
            return aPoint[0] - bPoint[0];
        }

        return diff;
    });

    return labels;
}

function createLabelText(labelIndexes: ReadonlyArray<number>, labels: ReadonlyArray<string>, options?: LabelOptions) {
    const defaultOptions = {
        lineSeparator: "\n",
        maxLineLength: 25,
        maxLinesCount: 3,
    };
    const { 
        maxLineLength,
        maxLinesCount,
        lineSeparator,
    } = { ...defaultOptions, ...options };
    const textSegments = new Array<string>();
    let lineLength = 0;
    let currentLine = 1;

    for (const index of labelIndexes) {
        const label = labels[index];

        if (lineLength + label.length <= maxLineLength) {
            textSegments.push(label);
            lineLength += label.length + 2;
        }
        else if (currentLine < maxLinesCount && label.length <= maxLineLength) {
            lineLength = label.length + 2;
            currentLine++;

            textSegments.push(`${lineSeparator}${label}`);
            lineLength += label.length + 2;
        }
    }

    if (textSegments.length === 0) {
        const label = labels[labelIndexes[0]];

        if (label.length <= maxLineLength + 3) {
            return label;
        }

        return `${label.slice(0, maxLineLength)}...`;
    }

    return textSegments.join(", ").replace(` ${lineSeparator}`, lineSeparator) + (labelIndexes.length === textSegments.length ? "" : "...");
}