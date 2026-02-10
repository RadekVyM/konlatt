import { createLabels } from "../../../utils/diagram";
import { withFallback } from "../../../utils/stores";
import useDiagramStore from "../../diagram/useDiagramStore";
import useDataStructuresStore from "../../useDataStructuresStore";
import { ExportDiagramStore } from "./useExportDiagramStore";
import withMeasuredLabelGroups from "./withMeasuredLabelGroups";

export default function withLabels(
    newState: Partial<ExportDiagramStore>,
    oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const context = useDataStructuresStore.getState().context;
    const attributesLabeling = useDiagramStore.getState().filteredAttributesLabeling;
    const objectsLabeling = useDiagramStore.getState().filteredObjectsLabeling;
    const maxLabelLineLength = withFallback(newState.maxLabelLineLength, oldState.maxLabelLineLength);
    const maxLabelLineCount = withFallback(newState.maxLabelLineCount, oldState.maxLabelLineCount);

    const attributeLabels = createLabels(
        "atribute",
        context?.attributes,
        attributesLabeling,
        "top",
        { maxLineLength: maxLabelLineLength, maxLinesCount: maxLabelLineCount });

    const objectLabels = createLabels(
        "object",
        context?.objects,
        objectsLabeling,
        "bottom",
        { maxLineLength: maxLabelLineLength, maxLinesCount: maxLabelLineCount });

    return withMeasuredLabelGroups({
        ...newState,
        attributeLabels,
        objectLabels,
    }, oldState);
}