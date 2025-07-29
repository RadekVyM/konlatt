import { DiagramStore } from "./useDiagramStore";
import { calculateLayoutBox, createDefaultDiagramOffsets } from "./utils";

export default function withDefaultLayoutBox(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const layout = newState.layout === undefined ? oldState.layout : newState.layout;
    const conceptToLayoutIndexesMapping = newState.conceptToLayoutIndexesMapping === undefined ? oldState.conceptToLayoutIndexesMapping : newState.conceptToLayoutIndexesMapping;
    const cameraType = newState.cameraType === undefined ? oldState.cameraType : newState.cameraType;
    const horizontalScale = newState.horizontalScale === undefined ? oldState.horizontalScale : newState.horizontalScale;
    const verticalScale = newState.verticalScale === undefined ? oldState.verticalScale : newState.verticalScale;

    if (!layout || layout.length !== conceptToLayoutIndexesMapping.size) {
        return { ...newState, defaultLayoutBox: null };
    }

    const conceptIndexes = layout.map((p) => p.conceptIndex);
    const diagramOffsets = createDefaultDiagramOffsets(layout.length);
    const defaultLayoutBox = calculateLayoutBox(conceptIndexes, layout, diagramOffsets, conceptToLayoutIndexesMapping, cameraType, horizontalScale, verticalScale);

    return { ...newState, defaultLayoutBox };
}