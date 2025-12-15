import { convertToSvg } from "../../../services/export/diagram/svg";
import { convertToTikz } from "../../../services/export/diagram/tikz";
import { sumLengths } from "../../../utils/array";
import { getLinks } from "../../../utils/diagram";
import useDiagramStore from "../../diagram/useDiagramStore";
import useDataStructuresStore from "../../useDataStructuresStore";
import { ExportDiagramStore } from "./useExportDiagramStore";

export default function withTextResult(newState: Partial<ExportDiagramStore>, oldState: ExportDiagramStore): Partial<ExportDiagramStore> {
    const selectedFormat = newState.selectedFormat !== undefined ? newState.selectedFormat : oldState.selectedFormat;
    const transformedLayout = newState.transformedLayout !== undefined ? newState.transformedLayout : oldState.transformedLayout;
    const attributeLabels = newState.attributeLabels !== undefined ? newState.attributeLabels : oldState.attributeLabels;
    const objectLabels = newState.objectLabels !== undefined ? newState.objectLabels : oldState.objectLabels;
    const positionedLabelGroups = newState.positionedLabelGroups !== undefined ? newState.positionedLabelGroups : oldState.positionedLabelGroups;
    const canvasDimensions = newState.canvasDimensions !== undefined ? newState.canvasDimensions : oldState.canvasDimensions;
    const nodeRadius = newState.nodeRadius !== undefined ? newState.nodeRadius : oldState.nodeRadius;
    const linkThickness = newState.linkThickness !== undefined ? newState.linkThickness : oldState.linkThickness;
    const backgroundColor = newState.backgroundColor !== undefined ? newState.backgroundColor : oldState.backgroundColor;
    const defaultNodeColor = newState.defaultNodeColor !== undefined ? newState.defaultNodeColor : oldState.defaultNodeColor;
    const defaultLinkColor = newState.defaultLinkColor !== undefined ? newState.defaultLinkColor : oldState.defaultLinkColor;
    const font = newState.font !== undefined ? newState.font : oldState.font;
    const textSize = newState.textSize !== undefined ? newState.textSize : oldState.textSize;
    const textBackgroundType = newState.textBackgroundType !== undefined ? newState.textBackgroundType : oldState.textBackgroundType;
    const textColor = newState.textColor !== undefined ? newState.textColor : oldState.textColor;
    const textBackgroundColor = newState.textBackgroundColor !== undefined ? newState.textBackgroundColor : oldState.textBackgroundColor;
    const textOutlineColor = newState.textOutlineColor !== undefined ? newState.textOutlineColor : oldState.textOutlineColor;

    if (selectedFormat === "jpg" || selectedFormat === "png") {
        return {
            ...newState,
            result: null,
            collapseRegions: null,
            charactersCount: undefined,
        };
    }

    const diagramStore = useDiagramStore.getState();
    const dataStructuresStore = useDataStructuresStore.getState();

    const links = getLinks(
        diagramStore.layout,
        dataStructuresStore.lattice,
        diagramStore.visibleConceptIndexes,
        diagramStore.filteredConceptIndexes,
        diagramStore.displayHighlightedSublatticeOnly);

    let result: Array<string> | null = null;
    let collapseRegions: Map<number, number> | null = null;

    switch (selectedFormat) {
        case "tikz":
            ({ lines: result, collapseRegions: collapseRegions } = convertToTikz(
                transformedLayout,
                links,
                diagramStore.conceptToLayoutIndexesMapping,
                attributeLabels,
                objectLabels));
            break;
        case "svg":
            ({ lines: result, collapseRegions: collapseRegions } = convertToSvg(
                transformedLayout,
                links,
                diagramStore.conceptToLayoutIndexesMapping,
                canvasDimensions,
                positionedLabelGroups,
                {
                    nodeRadius,
                    linkThickness,
                    backgroundColor,
                    defaultNodeColor,
                    defaultLinkColor,
                    font,
                    textBackgroundType,
                    textColor,
                    textBackgroundColor,
                    textOutlineColor,
                    textSize,
                }));
            break;
    }

    return {
        ...newState,
        result,
        collapseRegions,
        charactersCount: sumLengths(result),
    };
}