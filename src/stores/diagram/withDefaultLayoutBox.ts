import { withFallback } from "../../utils/stores";
import { DiagramStore } from "./useDiagramStore";
import { calculateLayoutBox, createDefaultDiagramOffsets } from "./utils";

export default function withDefaultLayoutBox(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const layout = withFallback(newState.layout, oldState.layout);
    const conceptToLayoutIndexesMapping = withFallback(newState.conceptToLayoutIndexesMapping, oldState.conceptToLayoutIndexesMapping);
    const cameraType = withFallback(newState.cameraType, oldState.cameraType);
    const horizontalScale = withFallback(newState.horizontalScale, oldState.horizontalScale);
    const verticalScale = withFallback(newState.verticalScale, oldState.verticalScale);
    const rotationDegrees = withFallback(newState.rotationDegrees, oldState.rotationDegrees);

    if (!layout || layout.length !== conceptToLayoutIndexesMapping.size) {
        return { ...newState, defaultLayoutBox: null };
    }

    const conceptIndexes = layout.map((p) => p.conceptIndex);
    const diagramOffsets = createDefaultDiagramOffsets(layout.length);
    const defaultLayoutBox = calculateLayoutBox(
        conceptIndexes,
        layout,
        diagramOffsets,
        conceptToLayoutIndexesMapping,
        cameraType,
        horizontalScale,
        verticalScale,
        rotationDegrees);

    return { ...newState, defaultLayoutBox };
}