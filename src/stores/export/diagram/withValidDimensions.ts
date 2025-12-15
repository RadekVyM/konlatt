import { MAX_CANVAS_AREA, MAX_CANVAS_HEIGHT, MAX_CANVAS_WIDTH } from "../../../constants/diagramExport";
import { ExportDiagramStore } from "./useExportDiagramStore";

export default function withValidDimensions(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const maxWidth = newState.maxWidth === undefined ? oldState.maxWidth : newState.maxWidth;
    const maxHeight = newState.maxHeight === undefined ? oldState.maxHeight : newState.maxHeight;

    if (maxWidth > MAX_CANVAS_WIDTH ||
        maxHeight > MAX_CANVAS_HEIGHT) {
        return { ...newState, maxWidth: oldState.maxWidth, maxHeight: oldState.maxHeight };
    }

    if (maxWidth * maxHeight > MAX_CANVAS_AREA) {
        if (maxWidth === maxHeight) {
            const size = Math.floor(Math.sqrt(MAX_CANVAS_AREA));

            return {
                ...newState,
                maxWidth: size,
                maxHeight: size,
            };
        }

        return {
            ...newState,
            maxWidth: maxWidth > maxHeight ? maxWidth : Math.floor(MAX_CANVAS_AREA / maxHeight),
            maxHeight: maxWidth > maxHeight ? Math.floor(MAX_CANVAS_AREA / maxWidth) : maxHeight,
        };
    }

    return newState;
}