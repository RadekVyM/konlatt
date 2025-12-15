import { CanvasDimensions } from "../../../types/export/CanvasDimensions";
import { LabelGroup } from "../../../types/export/LabelGroup";
import { Point } from "../../../types/Point";
import { layoutRect } from "../../../utils/layout";
import useDiagramStore from "../../diagram/useDiagramStore";
import { ExportDiagramStore } from "./useExportDiagramStore";

export default function withCanvasDimensions(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const transformedLayout = newState.transformedLayout !== undefined ? newState.transformedLayout : oldState.transformedLayout;
    const positionedLabelGroups = newState.positionedLabelGroups !== undefined ? newState.positionedLabelGroups : oldState.positionedLabelGroups;
    const nodeRadius = newState.nodeRadius !== undefined ? newState.nodeRadius : oldState.nodeRadius;
    const minPaddingLeft = newState.minPaddingLeft !== undefined ? newState.minPaddingLeft : oldState.minPaddingLeft;
    const minPaddingRight = newState.minPaddingRight !== undefined ? newState.minPaddingRight : oldState.minPaddingRight;
    const minPaddingTop = newState.minPaddingTop !== undefined ? newState.minPaddingTop : oldState.minPaddingTop;
    const minPaddingBottom = newState.minPaddingBottom !== undefined ? newState.minPaddingBottom : oldState.minPaddingBottom;
    const maxWidth = newState.maxWidth !== undefined ? newState.maxWidth : oldState.maxWidth;
    const maxHeight = newState.maxHeight !== undefined ? newState.maxHeight : oldState.maxHeight;

    if (!transformedLayout) {
        return { ...newState, canvasDimensions: null };
    }

    const rect = layoutRect(transformedLayout);
    const labelPadding = getPeripheralLabelPaddings(positionedLabelGroups, transformedLayout, rect, nodeRadius);

    const diagramWidth = rect.width;
    const diagramHeight = rect.height;

    const nodeDiameter = 2 * nodeRadius;
    const horizontalPadding = minPaddingLeft + minPaddingRight + nodeDiameter + labelPadding.left + labelPadding.right;
    const verticalPadding = minPaddingTop + minPaddingBottom + nodeDiameter + labelPadding.top + labelPadding.bottom;
    const maxDiagramWidth = Math.max(maxWidth - horizontalPadding, 0);
    const maxDiagramHeight = Math.max(maxHeight - verticalPadding, 0);

    const maxRatio = maxDiagramHeight === 0 ? Number.MAX_VALUE : maxDiagramWidth / maxDiagramHeight;
    const diagramRatio = diagramHeight === 0 ? Number.MAX_VALUE : diagramWidth / diagramHeight;

    const isZeroSizeDiagram = diagramWidth === 0 && diagramHeight === 0;
    const width = isZeroSizeDiagram ?
        0 :
        Math.ceil(diagramRatio > maxRatio ? maxDiagramWidth : diagramRatio * maxDiagramHeight);
    const height = isZeroSizeDiagram ?
        0 :
        Math.ceil(diagramRatio > maxRatio ? maxDiagramWidth / diagramRatio : maxDiagramHeight);

    const scale = isZeroSizeDiagram ?
        1 :
        diagramWidth === 0 ?
            height / diagramHeight :
            diagramHeight === 0 ?
                width / diagramWidth : 
                Math.min(width / diagramWidth, height / diagramHeight);
    const centerX = -rect.left * scale + nodeRadius + minPaddingLeft + labelPadding.left;
    const centerY = rect.top * scale + nodeRadius + minPaddingBottom + labelPadding.bottom;

    const finalWidth = Math.min(width + horizontalPadding, maxWidth);
    const finalHeight = Math.min(height + verticalPadding, maxHeight);

    const canvasDimensions: CanvasDimensions = {
        width: finalWidth,
        height: finalHeight,
        centerX,
        centerY: finalHeight - centerY,
        scale,
    };

    return {
        ...newState,
        canvasDimensions,
    };
}

function getPeripheralLabelPaddings(
    labelGroups: Array<LabelGroup>,
    layout: Array<Point>,
    rect: {
        left: number,
        right: number,
        top: number,
        bottom: number,
    },
    nodeRadius: number,
) {
    const conceptToLayoutIndexesMapping = useDiagramStore.getState().conceptToLayoutIndexesMapping;
    let left = 0;
    let right = 0;
    let top = 0;
    let bottom = 0;

    for (const group of labelGroups) {
        const layoutIndex = conceptToLayoutIndexesMapping.get(group.conceptIndex);

        if (layoutIndex === undefined || layoutIndex >= layout.length) {
            console.error(`Layout index should not be ${layoutIndex}`);
            continue;
        }

        const point = layout[layoutIndex];

        if (point[0] === rect.left) {
            left = Math.max(left, Math.abs(group.relativeRect.x));
        }
        if (point[0] === rect.right) {
            right = Math.max(right, group.relativeRect.x + group.relativeRect.width);
        }
        if (point[1] === rect.top) {
            top = Math.max(top, -group.relativeRect.y);
        }
        if (point[1] === rect.bottom) {
            bottom = Math.max(bottom, group.relativeRect.y + group.relativeRect.height);
        }
    }

    return {
        left: Math.max(0, left - nodeRadius),
        right: Math.max(0, right - nodeRadius),
        top: Math.max(0, top - nodeRadius),
        bottom: Math.max(0, bottom - nodeRadius),
    };
}