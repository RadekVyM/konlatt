import { useMemo } from "react";
import useExportDiagramStore from "../../../stores/export/useExportDiagramStore";
import { Point } from "../../../types/Point";
import { LabelGroup } from "./useLabelGroups";
import { layoutRect } from "../../../utils/layout";
import useDiagramStore from "../../../stores/diagram/useDiagramStore";

export type CanvasDimensions = {
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
}

export default function useCanvasDimensions(
    layout: Array<Point> | null,
    labelGroups: Array<LabelGroup>,
) : CanvasDimensions | null {
    const nodeRadius = useExportDiagramStore((state) => state.nodeRadius);
    const maxWidth = useExportDiagramStore((state) => state.maxWidth);
    const maxHeight = useExportDiagramStore((state) => state.maxHeight);
    const minPaddingLeft = useExportDiagramStore((state) => state.minPaddingLeft);
    const minPaddingRight = useExportDiagramStore((state) => state.minPaddingRight);
    const minPaddingTop = useExportDiagramStore((state) => state.minPaddingTop);
    const minPaddingBottom = useExportDiagramStore((state) => state.minPaddingBottom);

    return useMemo(() => {
        if (!layout) {
            return null;
        }

        const rect = layoutRect(layout);
        const labelPadding = getPeripheralLabelPaddings(labelGroups, layout, rect, nodeRadius);

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

        return {
            width: finalWidth,
            height: finalHeight,
            centerX,
            centerY: finalHeight - centerY,
            scale,
        };
    }, [layout, labelGroups, nodeRadius, maxWidth, maxHeight, minPaddingLeft, minPaddingRight, minPaddingTop, minPaddingBottom]);
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