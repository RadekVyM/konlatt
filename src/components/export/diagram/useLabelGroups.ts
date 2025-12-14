import { useMemo, useRef } from "react";
import { Rect } from "../../../types/Rect";
import useExportDiagramStore from "../../../stores/export/useExportDiagramStore";
import useDataStructuresStore from "../../../stores/useDataStructuresStore";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";
import { createLabels } from "../../../utils/diagram";
import { ConceptLabel } from "../../../types/ConceptLabel";
import { outlineWidth } from "./utils";

type LabelGroupLine = { text: string, relativeRect: Rect }

export type LabelGroup = {
    conceptIndex: number,
    labels: Array<LabelGroupLine>,
    placement: "top" | "bottom",
    relativeRect: Rect,
}

export default function useLabelGroups() {
    const canvasRef = useRef<OffscreenCanvas>(null);
    const { attributeLabels, objectLabels } = useLabels();
    const font = useExportDiagramStore((state) => state.font);
    const textSize = useExportDiagramStore((state) => state.textSize);
    const textOffset = useExportDiagramStore((state) => state.textOffset);
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const textBackgroundType = useExportDiagramStore((state) => state.textBackgroundType);

    const { labelGroups, bottomPadding } = useMemo(() => {
        if (!canvasRef.current) {
            canvasRef.current = new OffscreenCanvas(10, 10);
        }

        const groups = new Array<LabelGroup>();
        
        const context = canvasRef.current.getContext("2d")!;
        context.font = `${textSize}px ${font}`;

        const attributesBottomPadding = addLabelsToGroups(groups, attributeLabels, context);
        const objectsBottomPadding = addLabelsToGroups(groups, objectLabels, context);

        return {
            labelGroups: groups,
            bottomPadding: Math.max(attributesBottomPadding, objectsBottomPadding),
        };
    }, [textSize, attributeLabels, objectLabels, font]);

    return useMemo(() => {
        const horizontalPadding = textBackgroundType === "outline" ?
            outlineWidth(textSize) :
            textBackgroundType === "box" ?
                bottomPadding :
                0;
        const verticalPadding = textBackgroundType === "outline" ?
            outlineWidth(textSize) :
            0;
        const heightAddition = textBackgroundType === "box" ? bottomPadding / 2 : 0;

        return labelGroups.map((group) => {
            const offsetY = group.placement === "bottom" && textBackgroundType !== "box" ? bottomPadding / 2 : 0;

            return {
                ...group,
                relativeRect: {
                    ...group.relativeRect,
                    width: group.relativeRect.width + horizontalPadding,
                    height: group.relativeRect.height + heightAddition + verticalPadding,
                    x: group.relativeRect.x - (horizontalPadding / 2),
                    y: group.relativeRect.y +
                        offsetY -
                        (group.placement === "top" ? heightAddition : 0) -
                        (verticalPadding / 2) +
                        (nodeRadius + textOffset) * (group.placement === "top" ? -1 : 1),
                },
                labels: group.labels.map((label) => ({
                    ...label,
                    relativeRect: {
                        ...label.relativeRect,
                        x: label.relativeRect.x + (horizontalPadding / 2),
                        y: label.relativeRect.y + heightAddition + (verticalPadding / 2),
                    }
                })),
            };
        });
    }, [labelGroups, bottomPadding, textOffset, nodeRadius, textBackgroundType]);
}

function useLabels() {
    const context = useDataStructuresStore((state) => state.context);
    const attributesLabeling = useDiagramStore((state) => state.attributesLabeling);
    const objectsLabeling = useDiagramStore((state) => state.objectsLabeling);
    const maxLabelLineLength = useExportDiagramStore((state) => state.maxLabelLineLength);
    const maxLabelLineCount = useExportDiagramStore((state) => state.maxLabelLineCount);

    return useMemo(() => {
        const attributeLabels = createLabels(
            "atribute",
            context?.attributes,
            attributesLabeling,
            "top",
            { maxLineLength: maxLabelLineLength, maxLinesCount: maxLabelLineCount });

        const objectLabels = createLabels(
            "object",
            context?.objects,
            objectsLabeling,
            "bottom",
            { maxLineLength: maxLabelLineLength, maxLinesCount: maxLabelLineCount });

        return {
            attributeLabels,
            objectLabels,
        };
    }, [context?.attributes, context?.objects, attributesLabeling, objectsLabeling, maxLabelLineLength, maxLabelLineCount]);
}

function addLabelsToGroups(
    groups: Array<LabelGroup>,
    labels: Array<ConceptLabel>,
    context: OffscreenCanvasRenderingContext2D,
) {
    let maxHeightDiff = 0;
    
    for (const label of labels) {
        const groupLines = new Array<LabelGroupLine>();
        const lines = label.text.split("\n");
        let maxWidth = 0;
        let totalHeight = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const measuredRect = context.measureText(line);
            const width = measuredRect.width;
            const fontHeight = Math.abs(measuredRect.fontBoundingBoxAscent) + Math.abs(measuredRect.fontBoundingBoxDescent);
            const actualHeight = Math.abs(measuredRect.actualBoundingBoxAscent) + Math.abs(measuredRect.actualBoundingBoxDescent);

            maxWidth = Math.max(maxWidth, width);
            maxHeightDiff = Math.max(maxHeightDiff, fontHeight - actualHeight);
            totalHeight += fontHeight;

            groupLines.push({
                text: line,
                relativeRect: {
                    width,
                    height: fontHeight,
                    x: 0,
                    y: i * fontHeight,
                },
            });
        }

        for (const line of groupLines) {
            line.relativeRect.x += (maxWidth - line.relativeRect.width) / 2;
        }

        groups.push({
            conceptIndex: label.conceptIndex,
            labels: groupLines,
            placement: label.placement,
            relativeRect: {
                x: maxWidth / -2,
                y: label.placement === "top" ?
                    -totalHeight :
                    0,
                width: maxWidth,
                height: totalHeight,
            },
        });
    }

    return maxHeightDiff;
}