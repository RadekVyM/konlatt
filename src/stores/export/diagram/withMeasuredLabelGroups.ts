import { ConceptLabel } from "../../../types/ConceptLabel";
import { LabelGroup, LabelGroupLine } from "../../../types/export/LabelGroup";
import { ExportDiagramStore } from "./useExportDiagramStore";
import withPositionedLabelGroups from "./withPositionedLabelGroups";

export default function withMeasuredLabelGroups(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const measuringCanvas = newState.measuringCanvas !== undefined ? newState.measuringCanvas : oldState.measuringCanvas;
    const textSize = newState.textSize !== undefined ? newState.textSize : oldState.textSize;
    const font = newState.font !== undefined ? newState.font : oldState.font;
    const attributeLabels = newState.attributeLabels !== undefined ? newState.attributeLabels : oldState.attributeLabels;
    const objectLabels = newState.objectLabels !== undefined ? newState.objectLabels : oldState.objectLabels;

    const groups = new Array<LabelGroup>();
    
    const context = measuringCanvas.getContext("2d")!;
    context.font = `${textSize}px ${font}`;

    const attributesBottomPadding = addLabelsToGroups(groups, attributeLabels, context);
    const objectsBottomPadding = addLabelsToGroups(groups, objectLabels, context);

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