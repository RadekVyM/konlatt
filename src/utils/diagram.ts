import { getPoint, themedColor } from "../components/concepts/diagram/utils";
import { DIM_NODE_COLOR_DARK, DIM_NODE_COLOR_LIGHT, NODE_COLOR_DARK, NODE_COLOR_LIGHT, PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../constants/canvas-drawing";
import { CameraType } from "../types/diagram/CameraType";
import { ConceptLabel, PositionedConceptLabel } from "../types/ConceptLabel";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../types/ConceptLatticeLayout";
import { LabelOptions } from "../types/LabelOptions";
import { Link } from "../types/Link";
import { createPoint, Point } from "../types/Point";
import { CurrentTheme } from "../types/Theme";
import { transformedPoint } from "./layout";
import { Object3D, Vector3 } from "three";

export function setupLinkTransform(temp: Object3D, from: Point, to: Point, initialDirection: Vector3, lineThickness: number) {
    // Vector math for link placement
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const dz = to[2] - from[2];
    const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

    // Position: Move to the start point
    temp.position.set(from[0], from[1], from[2]);
    // Rotation: Orient towards the end point
    temp.quaternion.setFromUnitVectors(initialDirection, new Vector3(dx, dy, dz).normalize());
    // Scale: Stretch X-axis to reach the length, keep Y/Z at lineThickness
    temp.scale.set(length, lineThickness, lineThickness);

    temp.updateMatrix();
}

export function getNodeColor(
    conceptIndex: number | null | undefined,
    selectedConceptIndex: number | null,
    filteredConceptIndexes: Set<number> | null,
    currentTheme: CurrentTheme,
    forceDimColor?: boolean,
) {
    const dimColor = themedColor(DIM_NODE_COLOR_LIGHT, DIM_NODE_COLOR_DARK, currentTheme);

    if (forceDimColor) {
        return dimColor;
    }

    const isSelected = conceptIndex === selectedConceptIndex;
    const isFilteredOut = conceptIndex !== undefined &&
        conceptIndex !== null &&
        filteredConceptIndexes &&
        !filteredConceptIndexes.has(conceptIndex);

    const color = isSelected ?
        themedColor(PRIMARY_COLOR_LIGHT, PRIMARY_COLOR_DARK, currentTheme) :
        isFilteredOut ?
            dimColor :
            themedColor(NODE_COLOR_LIGHT, NODE_COLOR_DARK, currentTheme);

    return color;
}

export function getDiagramLinks(
    concepts: Array<{ conceptIndex: number }> | null,
    subconceptsMapping: ReadonlyArray<Set<number>> | null,
    sublatticeConceptIndexes: Set<number> | null,
    filteredConceptIndexes: Set<number> | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const links = new Array<Link>();
    const isSublatticeHighlighted = !sublatticeConceptIndexes || sublatticeConceptIndexes.size === 0;

    if (!concepts || !subconceptsMapping) {
        return links;
    }

    let i = 0;

    for (const concept of concepts) {
        for (const subconceptIndex of subconceptsMapping[concept.conceptIndex]) {
            const isNotInSublattice = sublatticeConceptIndexes && !sublatticeConceptIndexes.has(subconceptIndex);

            if (displayHighlightedSublatticeOnly && isNotInSublattice) {
                continue;
            }

            const isInSublattice = !!sublatticeConceptIndexes && sublatticeConceptIndexes.has(concept.conceptIndex) && sublatticeConceptIndexes.has(subconceptIndex);
            const isFiltered = !!filteredConceptIndexes && filteredConceptIndexes.has(concept.conceptIndex) && filteredConceptIndexes.has(subconceptIndex);

            const finalIsVisible = isSublatticeHighlighted ? isFiltered : isInSublattice && (!displayHighlightedSublatticeOnly || isFiltered);

            links.push({
                conceptIndex: concept.conceptIndex,
                subconceptIndex,
                linkId: i,
                isHighlighted: finalIsVisible,
                isColored: false,
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