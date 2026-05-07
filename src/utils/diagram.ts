import { getPoint, themedColor } from "../components/concepts/diagram/utils";
import { DIM_NODE_COLOR_DARK, DIM_NODE_COLOR_LIGHT, NODE_COLOR_DARK, NODE_COLOR_LIGHT, PRIMARY_COLOR_DARK, PRIMARY_COLOR_LIGHT } from "../constants/canvas-drawing";
import { CameraType } from "../types/diagram/CameraType";
import { ConceptLabel, PositionedConceptLabel } from "../types/ConceptLabel";
import { ConceptLatticeLabeling } from "../types/ConceptLatticeLabeling";
import { ConceptLatticeLayout } from "../types/diagram/ConceptLatticeLayout";
import { LabelOptions } from "../types/LabelOptions";
import { Link } from "../types/Link";
import { createPoint, Point } from "../types/Point";
import { CurrentTheme } from "../types/Theme";
import { transformedPoint } from "./layout";
import { Object3D, Vector3 } from "three";
import { Relation } from "../types/Relation";

/**
 * Transforms a 3D object to act as a link between two nodes (points).
 * Adjusts position, rotation (quaternion), and scale to span the distance.*
 * @param temp - The 3D object to transform.
 * @param from - Start point.
 * @param to - End point.
 * @param initialDirection - The default orientation vector of the geometry (usually Vector3(1, 0, 0)).
 * @param lineThickness - The thickness (scale) applied to the non-length axes.
 */
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

/**
 * Determines the color for a node based on its selection, filtering, and theme state.
 * @param conceptIndex - The index of the current concept node.
 * @param selectedConceptIndex - The index of the currently selected concept.
 * @param filteredConceptIndexes - A set of concept indexes that should remain highlighted.
 * @param currentTheme
 * @param forceDimColor - If `true`, ignores selection/filter and returns the dimmed color.
 */
export function getNodeColor(
    conceptIndex: number | null | undefined,
    selectedConceptIndex: number | null,
    filteredConceptIndexes: ReadonlySet<number> | null,
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

/**
 * Generates an array of `Link` objects representing links between concepts in a lattice.
 * Handles visibility logic for sublattices and filtered views.
 * @param concepts - List of concept objects containing their indexes.
 * @param subconceptsRelation - Mapping of concept index to its direct children/subconcepts.
 * @param sublatticeConceptIndexes - Set of indexes belonging to the currently focused sublattice.
 * @param filteredConceptIndexes - Set of indexes that are currently filtered.
 * @param displayHighlightedSublatticeOnly - If `true`, hides links not contained within the sublattice.
 */
export function getDiagramLinks(
    concepts: ReadonlyArray<{ conceptIndex: number }> | null,
    subconceptsRelation: Relation | null,
    sublatticeConceptIndexes: ReadonlySet<number> | null,
    filteredConceptIndexes: ReadonlySet<number> | null,
    displayHighlightedSublatticeOnly: boolean,
) {
    const links = new Array<Link>();
    const isSublatticeHighlighted = !sublatticeConceptIndexes || sublatticeConceptIndexes.size === 0;

    if (!concepts || !subconceptsRelation) {
        return links;
    }

    let i = 0;

    for (const concept of concepts) {
        for (const subconceptIndex of subconceptsRelation[concept.conceptIndex]) {
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

/**
 * Creates unpositioned label objects for concept nodes.
 * @param idPrefix - Prefix for the label ID.
 * @param itemLabels - Full list of available string labels.
 * @param latticeLabeling - Map associating concept indexes with an array of label indexes.
 * @param placement - Vertical alignment relative to the node.
 * @param options - Text formatting options.
 */
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

/**
 * Creates label objects and calculates their coordinates based on the lattice layout.
 * @param idPrefix - Prefix for the label ID.
 * @param itemLabels - Full list of available string labels.
 * @param latticeLabeling - Map associating concept indexes with an array of label indexes.
 * @param layout - Layout of the concept nodes.
 * @param conceptToLayoutIndexesMapping - Map associating concept indexes with layout indexes.
 * @param cameraType - Affects z-depth offsetting.
 * @param horizontalScale - Scale factor for X coordinates.
 * @param verticalScale - Scale factor for Y coordinates.
 * @param rotationDegrees - Global diagram rotation.
 * @param diagramOffsets - Per-node positional offsets.
 * @param placement - Vertical alignment relative to the node.
 * @param options - Text formatting options.
 */
export function createLabelsWithPositions(
    idPrefix: string,
    itemLabels: ReadonlyArray<string> | undefined,
    latticeLabeling: ConceptLatticeLabeling | null,
    layout: ConceptLatticeLayout | null,
    conceptToLayoutIndexesMapping: ReadonlyMap<number, number>,
    cameraType: CameraType,
    horizontalScale: number,
    verticalScale: number,
    rotationDegrees: number,
    diagramOffsets: ReadonlyArray<Point> | null,
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

/**
 * Sorts labels primarily by their Y-coordinate and secondarily by X-coordinate.
 */
export function sortedLabelsByPosition(
    labels: ReadonlyArray<ConceptLabel>,
    layout: ReadonlyArray<Point>,
    conceptToLayoutIndexesMapping: ReadonlyMap<number, number>,
) {
    const newLabels = [...labels];

    newLabels.sort((a, b) => {
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

    return newLabels;
}

/**
 * Internal helper to format and wrap text for concept labels.
 * Implements logic for line length constraints, word wrapping, and ellipsis.
 */
function createLabelText(labelIndexes: ReadonlyArray<number>, labels: ReadonlyArray<string>, options?: LabelOptions) {
    const defaultOptions = {
        lineSeparator: "\n",
        labelSeparator: ", ",
        maxLineLength: 25,
        maxLinesCount: 3,
        fillAsMuchAsPossible: false,
    };
    const { 
        maxLineLength,
        maxLinesCount,
        lineSeparator,
        labelSeparator,
        fillAsMuchAsPossible,
    } = { ...defaultOptions, ...options };

    let result = "";
    let currentLineText = "";
    let linesCount = 1;

    for (let i = 0; i < labelIndexes.length; i++) {
        const label = labels[labelIndexes[i]];
        const suffix = i === labelIndexes.length - 1 ? "" : labelSeparator;
        const words = (label + suffix).split(" ");

        for (let j = 0; j < words.length; j++) {
            let word = words[j];
            const space = j > 0 ? " " : "";
            
            if (currentLineText.length + space.length + word.length <= maxLineLength) {
                currentLineText += space + word;
            }
            // Word doesn't fit, move to new line or split
            else {
                // If not on first word of line, try moving to a new line first
                if (currentLineText.length > 0 && linesCount < maxLinesCount) {
                    result += currentLineText + lineSeparator;
                    currentLineText = "";
                    linesCount++;
                    j--; // Re-process same word on the new line
                    continue;
                }

                // If word is still too long for an empty line, do a hard break
                const availableSpace = maxLineLength - currentLineText.length - space.length;
                
                if (linesCount < maxLinesCount) {
                    // Fill current line, wrap remainder
                    const part = word.slice(0, availableSpace);
                    const remainder = word.slice(availableSpace);
                    currentLineText += space + part + "-";
                    result += currentLineText + lineSeparator;
                    currentLineText = "";
                    linesCount++;
                    words[j] = remainder; // Process remainder next
                    j--;
                }
                else {
                    // Final line
                    const finalPart = fillAsMuchAsPossible ?
                        word.slice(0, Math.max(0, maxLineLength - currentLineText.length - space.length - 3)) :
                        "";
                    currentLineText = currentLineText + space + finalPart;

                    if (currentLineText.endsWith(labelSeparator)) {
                        currentLineText = currentLineText.slice(0, currentLineText.length - labelSeparator.length);
                    }
                    return result + currentLineText + "...";
                }
            }
        }
    }

    return result + currentLineText;
}