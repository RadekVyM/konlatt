import { outlineWidth } from "../../../utils/export";
import { ExportDiagramStore } from "./useExportDiagramStore";
import withCanvasDimensions from "./withCanvasDimensions";

export default function withPositionedLabelGroups(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const measuredLabelGroups = newState.measuredLabelGroups !== undefined ? newState.measuredLabelGroups : oldState.measuredLabelGroups;
    const measuredBottomLabelPadding = newState.measuredBottomLabelPadding !== undefined ? newState.measuredBottomLabelPadding : oldState.measuredBottomLabelPadding;
    const textBackgroundType = newState.textBackgroundType !== undefined ? newState.textBackgroundType : oldState.textBackgroundType;
    const textSize = newState.textSize !== undefined ? newState.textSize : oldState.textSize;
    const nodeRadius = newState.nodeRadius !== undefined ? newState.nodeRadius : oldState.nodeRadius;
    const textOffset = newState.textOffset !== undefined ? newState.textOffset : oldState.textOffset;

    const horizontalPadding = textBackgroundType === "outline" ?
        outlineWidth(textSize) :
        textBackgroundType === "box" ?
            measuredBottomLabelPadding * 1.5 :
            0;
    const verticalPadding = textBackgroundType === "outline" ?
        outlineWidth(textSize) :
        0;
    const heightAddition = textBackgroundType === "box" ? measuredBottomLabelPadding * 0.75 : 0;

    const positionedLabelGroups = measuredLabelGroups.map((group) => {
        const offsetY = group.placement === "bottom" && textBackgroundType !== "box" ? measuredBottomLabelPadding / 2 : 0;

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

    return withCanvasDimensions({
        ...newState,
        positionedLabelGroups,
    }, oldState);
}