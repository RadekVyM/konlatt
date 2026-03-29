import { DiagramExportFormat } from "../../../types/export/DiagramExportFormat";
import { withFallback } from "../../../utils/stores";
import { ExportDiagramStore } from "./useExportDiagramStore";

const TOO_LARGE_THRESHOLD = 15_000_000;

/**
 * Checks if the current export configuration would result 
 * in a payload that is too large for the browser to handle efficiently.
 */
export default function withTooLarge(newState: Partial<ExportDiagramStore>, oldState: ExportDiagramStore): Partial<ExportDiagramStore> {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const transformedLayout = withFallback(newState.transformedLayout, oldState.transformedLayout);
    const links = withFallback(newState.links, oldState.links);

    if (transformedLayout === null || links === null || (selectedFormat !== "svg" && selectedFormat !== "tikz")) {
        return newState;
    }

    const linesCountEstimate = transformedLayout.length + links.length + labelLinesCountEstimate(newState, oldState);
    const charactersCountEstimate = linesCountEstimate * averageLineLength(selectedFormat);
    const isTooLarge = charactersCountEstimate > TOO_LARGE_THRESHOLD;

    return {
        ...newState,
        disabledComputation: isTooLarge,
    };
}

/**
 * Estimates the number of lines required to render labels based on the export format.
 */
function labelLinesCountEstimate(newState: Partial<ExportDiagramStore>, oldState: ExportDiagramStore) {
    const selectedFormat = withFallback(newState.selectedFormat, oldState.selectedFormat);
    const objectLabels = withFallback(newState.objectLabels, oldState.objectLabels);
    const attributeLabels = withFallback(newState.attributeLabels, oldState.attributeLabels);
    const positionedLabelGroups = withFallback(newState.positionedLabelGroups, oldState.positionedLabelGroups);

    switch (selectedFormat) {
        case "svg":
            return positionedLabelGroups.reduce((previous, current) => previous + current.labels.length, 0) * 2; // + some constant
        case "tikz":
            return objectLabels.length + attributeLabels.length; // + some constant
    }

    return 0;
}

/**
 * Returns the average character length per line for a given format based on benchmarked data.
 */
function averageLineLength(format: DiagramExportFormat) {
    // These numbers are experimentally measured on 5 datasets
    switch (format) {
        case "svg":
            return 95.94969971803079;
        case "tikz":
            return 72.09136148833554;
    }

    return 0;
}