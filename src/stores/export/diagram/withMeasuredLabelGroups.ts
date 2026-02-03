import { ConceptLabel } from "../../../types/ConceptLabel";
import { LabelGroupLine, LabelGroup } from "../../../types/export/LabelGroup";
import { withFallback } from "../../../utils/stores";
import useDiagramStore from "../../diagram/useDiagramStore";
import { ExportDiagramStore } from "./useExportDiagramStore";
import withPositionedLabelGroups from "./withPositionedLabelGroups";

export default function withMeasuredLabelGroups(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const measuringCanvas = withFallback(newState.measuringCanvas, oldState.measuringCanvas);
    const textSize = withFallback(newState.textSize, oldState.textSize);
    const font = withFallback(newState.font, oldState.font);
    const attributeLabels = withFallback(newState.attributeLabels, oldState.attributeLabels);
    const objectLabels = withFallback(newState.objectLabels, oldState.objectLabels);

    const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;

    const groups = new Array<LabelGroup>();
    
    const context = measuringCanvas.getContext("2d")!;
    context.font = `${textSize}px ${font}`;

    const attributesBottomPadding = addLabelsToGroups(groups, attributeLabels, context, conceptToLayoutIndexesMapping);
    const objectsBottomPadding = addLabelsToGroups(groups, objectLabels, context, conceptToLayoutIndexesMapping);

    return withPositionedLabelGroups({
        ...newState,
        measuredLabelGroups: groups,
        measuredBottomLabelPadding: Math.max(attributesBottomPadding, objectsBottomPadding),
    }, oldState);
}


function addLabelsToGroups(
    groups: Array<LabelGroup>,
    labels: Array<ConceptLabel>,
    context: OffscreenCanvasRenderingContext2D,
    conceptToLayoutIndexesMapping: Map<number, number>,
) {
    let maxHeightDiff = 0;

    for (const label of labels) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(label.conceptIndex);

        if (layoutIndex === undefined) {
            // This concept is not rendered => label is not rendered
            continue;
        }

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
            layoutIndex,
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