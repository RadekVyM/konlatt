import { getPoint } from "../components/concepts/diagram/utils";
import { CameraType } from "../types/CameraType";
import { ConceptLabel } from "../types/ConceptLabel";
import { ConceptLattice } from "../types/ConceptLattice";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { Link } from "../types/Link";
import { createPoint, Point } from "../types/Point";
import { transformedPoint } from "./layout";

export function getLinks(
    layout: ConceptLatticeLayout | null,
    lattice: ConceptLattice | null,
    visibleConceptIndexes: Set<number> | null,
    filteredConceptIndexes: Set<number> | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const links = new Array<Link>();
    const noInvisibleConcepts = !visibleConceptIndexes || visibleConceptIndexes.size === 0;

    if (!layout || !lattice?.subconceptsMapping) {
        return links;
    }

    let i = 0;

    for (const node of layout) {
        for (const subconceptIndex of lattice.subconceptsMapping[node.conceptIndex]) {
            const isNotVisible = visibleConceptIndexes && !visibleConceptIndexes.has(subconceptIndex);

            if (displayHighlightedSublatticeOnly && isNotVisible) {
                continue;
            }

            const isVisible = !!visibleConceptIndexes && visibleConceptIndexes.has(node.conceptIndex) && visibleConceptIndexes.has(subconceptIndex);
            const isFiltered = !!filteredConceptIndexes && filteredConceptIndexes.has(node.conceptIndex) && filteredConceptIndexes.has(subconceptIndex);

            const finalIsVisible = noInvisibleConcepts ? isFiltered : isVisible && (!displayHighlightedSublatticeOnly || isFiltered);

            links.push({
                conceptIndex: node.conceptIndex,
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
    labels: ReadonlyArray<string> | undefined,
    labeling: ConceptLatticeLabeling | null,
    layout: ConceptLatticeLayout | null,
    conceptToLayoutIndexesMapping: Map<number, number>,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    diagramOffsets: Array<Point> | null,
    placement: "top" | "bottom",
    lineSeparator: string = "\n",
) {
    const newLabels = new Array<ConceptLabel>();
    const zOffset = cameraType === "2d" ? 0.002 : 0;

    if (!labels || !labeling || !layout || !diagramOffsets || conceptToLayoutIndexesMapping.size !== layout.length) {
        return newLabels;
    }

    for (const [conceptIndex, labelIndexes] of labeling) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(conceptIndex);

        if (labelIndexes.length === 0 || layoutIndex === undefined || layoutIndex >= layout.length) {
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

        const text = createLabelText(labelIndexes, labels, lineSeparator);

        newLabels.push({
            id: `${idPrefix}-${conceptIndex}`,
            position,
            text,
            conceptIndex,
            placement,
        });
    }

    return newLabels;
}

export function sortedLabelsByPosition(labels: Array<ConceptLabel>) {
    labels = [...labels];

    labels.sort((a, b) => {
        const diff = a.position[1] - b.position[1];

        if (diff === 0) {
            return a.position[0] - b.position[0];
        }

        return diff;
    });

    return labels;
}

function createLabelText(labelIndexes: ReadonlyArray<number>, labels: ReadonlyArray<string>, lineSeparator: string = "\n") {
    const maxLineLength = 25;
    const maxLinesCount = 3;
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