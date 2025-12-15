import { transformedLayoutForExport } from "../../../utils/export";
import useDiagramStore from "../../diagram/useDiagramStore";
import { ExportDiagramStore } from "./useExportDiagramStore";

export default function withTransformedLayout(
    newState: Partial<ExportDiagramStore>,
    _oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const diagramStore = useDiagramStore.getState();

    const transformedLayout = transformedLayoutForExport(
        diagramStore.layout,
        diagramStore.diagramOffsets,
        diagramStore.horizontalScale,
        diagramStore.verticalScale,
        diagramStore.rotationDegrees);

    return {
        ...newState,
        transformedLayout,
    };
}