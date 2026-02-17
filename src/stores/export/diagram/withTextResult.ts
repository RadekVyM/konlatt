import { convertToSvg } from "../../../services/export/diagram/svg";
import { convertToTikz } from "../../../services/export/diagram/tikz";
import { sumLengths } from "../../../utils/array";
import { withFallback } from "../../../utils/stores";
import useDiagramStore from "../../diagram/useDiagramStore";
import { ExportDiagramStore } from "./useExportDiagramStore";

export default function withTextResult(newState: Partial<ExportDiagramStore>, oldState: ExportDiagramStore): Partial<ExportDiagramStore> {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const transformedLayout = withFallback(newState.transformedLayout, oldState.transformedLayout);
    const links = withFallback(newState.links, oldState.links);

    if (selectedFormat === "jpg" || selectedFormat === "png" || links === null) {
        return {
            ...newState,
            result: null,
            collapseRegions: null,
            charactersCount: undefined,
        };
    }

    const diagramStore = useDiagramStore.getState();

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "tikz":
            ({ lines: result, collapseRegions: collapseRegions } = convertToTikz(
                transformedLayout,
                links,
                diagramStore.conceptToLayoutIndexesMapping,
                withFallback(newState.attributeLabels, oldState.attributeLabels),
                withFallback(newState.objectLabels, oldState.objectLabels)));
            break;
        case "svg":
            ({ lines: result, collapseRegions: collapseRegions } = convertToSvg(
                transformedLayout,
                links,
                diagramStore.conceptToLayoutIndexesMapping,
                withFallback(newState.canvasDimensions, oldState.canvasDimensions),
                withFallback(newState.positionedLabelGroups, oldState.positionedLabelGroups),
                {
                    nodeRadius: withFallback(newState.nodeRadius, oldState.nodeRadius),
                    linkThickness: withFallback(newState.linkThickness, oldState.linkThickness),
                    backgroundColor: withFallback(newState.backgroundColor, oldState.backgroundColor),
                    defaultNodeColor: withFallback(newState.defaultNodeColor, oldState.defaultNodeColor),
                    defaultLinkColor: withFallback(newState.defaultLinkColor, oldState.defaultLinkColor),
                    font: withFallback(newState.font, oldState.font),
                    textBackgroundType: withFallback(newState.textBackgroundType, oldState.textBackgroundType),
                    textColor: withFallback(newState.textColor, oldState.textColor),
                    textBackgroundColor: withFallback(newState.textBackgroundColor, oldState.textBackgroundColor),
                    textOutlineColor: withFallback(newState.textOutlineColor, oldState.textOutlineColor),
                    textSize: withFallback(newState.textSize, oldState.textSize),
                }));
            break;
    }

    return {
        ...newState,
        result,
        collapseRegions,
        charactersCount: sumLengths(result, 1),
    };
}