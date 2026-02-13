import { getAttributesLabeling, getObjectsLabeling } from "../../services/lattice";
import { withFallback } from "../../utils/stores";
import useDataStructuresStore from "../useDataStructuresStore";
import { DiagramStore } from "./useDiagramStore";
import withFilteredDiagramLabeling from "./withFilteredDiagramLabeling";

export default function withDiagramLabeling(newState: Partial<DiagramStore>, oldState: DiagramStore): Partial<DiagramStore> {
    const sublatticeConceptIndexes = withFallback(newState.sublatticeConceptIndexes, oldState.sublatticeConceptIndexes);
    const displayHighlightedSublatticeOnly = withFallback(newState.displayHighlightedSublatticeOnly, oldState.displayHighlightedSublatticeOnly);
    const recalculateLabelingOfSublatticeOnly = withFallback(newState.recalculateLabelingOfSublatticeOnly, oldState.recalculateLabelingOfSublatticeOnly);

    const dataStructures = useDataStructuresStore.getState();
    const concepts = dataStructures.concepts;
    const lattice = dataStructures.lattice;

    if (!recalculateLabelingOfSublatticeOnly || !displayHighlightedSublatticeOnly || !sublatticeConceptIndexes || !concepts || !lattice) {
        return withFilteredDiagramLabeling({
            ...newState,
            attributesLabeling: lattice?.attributesLabeling || null,
            objectsLabeling: lattice?.objectsLabeling || null,
        }, oldState);
    }

    const attributesLabeling = getAttributesLabeling(concepts, lattice.subconceptsMapping, sublatticeConceptIndexes);
    const objectsLabeling = getObjectsLabeling(concepts, lattice.superconceptsMapping, sublatticeConceptIndexes);

    return withFilteredDiagramLabeling({
        ...newState,
        attributesLabeling,
        objectsLabeling,
    }, oldState);
}