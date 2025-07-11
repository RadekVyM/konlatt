import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { DiagramLayoutState } from "../../types/DiagramLayoutState";

export function createEmptyDiagramOffsetMementos() {
    return { redos: [], undos: [] };
}

export function createConceptLayoutIndexesMappings(layout: ConceptLatticeLayout | null) {
    const conceptToLayoutIndexesMapping = new Map<number, number>();
    const layoutToConceptIndexesMapping = new Map<number, number>();

    if (layout !== null) {
        for (let i = 0; i < layout.length; i++) {
            const point = layout[i];
            conceptToLayoutIndexesMapping.set(point.conceptIndex, i);
            layoutToConceptIndexesMapping.set(i, point.conceptIndex);
        }
    }

    return {
        conceptToLayoutIndexesMapping,
        layoutToConceptIndexesMapping,
    };
}

export function createDiagramLayoutStateId(state: DiagramLayoutState) {
    const start = state.displayHighlightedSublatticeOnly ?
        `${state.lowerConeOnlyConceptIndex};${state.upperConeOnlyConceptIndex}` :
        "null;null";

    return `${start}`;
}