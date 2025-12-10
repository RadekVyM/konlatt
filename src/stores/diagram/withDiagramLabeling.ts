import { getAttributesLabeling, getObjectsLabeling } from "../../services/lattice";
import useDataStructuresStore from "../useDataStructuresStore";
import { DiagramStore } from "./useDiagramStore";

export default function withDiagramLabeling(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const visibleConceptIndexes = newState.visibleConceptIndexes !== undefined ? newState.visibleConceptIndexes : oldState.visibleConceptIndexes;
    const displayHighlightedSublatticeOnly = newState.displayHighlightedSublatticeOnly !== undefined ? newState.displayHighlightedSublatticeOnly : oldState.displayHighlightedSublatticeOnly;
    const recalculateLabelingOfSublatticeOnly = newState.recalculateLabelingOfSublatticeOnly !== undefined ? newState.recalculateLabelingOfSublatticeOnly : oldState.recalculateLabelingOfSublatticeOnly;

    const dataStructures = useDataStructuresStore.getState();
    const concepts = dataStructures.concepts;
    const lattice = dataStructures.lattice;

    if (!recalculateLabelingOfSublatticeOnly || !displayHighlightedSublatticeOnly || !visibleConceptIndexes || !concepts || !lattice) {
        return {
            ...newState,
            attributesLabeling: lattice?.attributesLabeling || null,
            objectsLabeling: lattice?.objectsLabeling || null,
        };
    }

    const attributesLabeling = getAttributesLabeling(concepts, lattice.subconceptsMapping, visibleConceptIndexes);
    const objectsLabeling = getObjectsLabeling(concepts, lattice.superconceptsMapping, visibleConceptIndexes);

    return {
        ...newState,
        attributesLabeling,
        objectsLabeling,
    };
}