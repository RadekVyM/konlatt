import { getLinks } from "../../../utils/diagram";
import useDiagramStore from "../../diagram/useDiagramStore";
import useDataStructuresStore from "../../useDataStructuresStore";
import { ExportDiagramStore } from "./useExportDiagramStore";

export default function withLinks(
    newState: Partial<ExportDiagramStore>,
    _oldState: ExportDiagramStore,
): Partial<ExportDiagramStore> {
    const diagramStore = useDiagramStore.getState();
    const dataStructuresStore = useDataStructuresStore.getState();

    const links = getLinks(
        diagramStore.layout,
        dataStructuresStore.lattice?.subconceptsMapping || null,
        diagramStore.sublatticeConceptIndexes,
        diagramStore.filteredConceptIndexes,
        diagramStore.displayHighlightedSublatticeOnly);

    return {
        ...newState,
        links,
    };
}