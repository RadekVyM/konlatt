import { ExplorerConcept } from "../../types/ExplorerConcept";
import { createPoint } from "../../types/Point";
import { withFallback } from "../../utils/stores";
import { ExplorerStore } from "./useExplorerStore";

export default function withExplorerConcepts(newState: Partial<ExplorerStore>, oldState: ExplorerStore): Partial<ExplorerStore> {
    const lattice = withFallback(newState.lattice, oldState.lattice);
    const selectedConceptIndex = withFallback(newState.selectedConceptIndex, oldState.selectedConceptIndex);

    if (lattice === null || selectedConceptIndex === null) {
        return newState;
    }

    const superconcepts = lattice.superconceptsMapping[selectedConceptIndex];
    const subconcepts = lattice.subconceptsMapping[selectedConceptIndex];

    const conceptToLayoutIndexesMapping = new Map<number, number>();
    const layoutToConceptIndexesMapping = new Map<number, number>();
    const concepts = new Array<ExplorerConcept>();

    pushConcept(
        concepts,
        {
            layoutIndex: 0,
            conceptIndex: selectedConceptIndex,
            position: createPoint(0, 0, 0),
        },
        conceptToLayoutIndexesMapping,
        layoutToConceptIndexesMapping);

    pushConcepts(concepts, superconcepts, 1, conceptToLayoutIndexesMapping, layoutToConceptIndexesMapping);
    pushConcepts(concepts, subconcepts, -1, conceptToLayoutIndexesMapping, layoutToConceptIndexesMapping);

    return {
        ...newState,
        concepts,
        conceptToLayoutIndexesMapping,
        layoutToConceptIndexesMapping,
    };
}

// Places the concepts around the circumference of a half circle
function pushConcepts(
    concepts: Array<ExplorerConcept>,
    conceptIndexes: Set<number>,
    verticalScale: number,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutToConceptIndexesMapping: Map<number, number>,
) {
    if (concepts.length === 0) {
        return;
    }

    const nodesDistance = 1.2;
    const halfCircumference = (conceptIndexes.size + 1) * nodesDistance;
    const radius = Math.max(halfCircumference / Math.PI, 1);
    
    const angleDelta = Math.PI / (conceptIndexes.size + 1);
    const startAngle = angleDelta;
    
    let i = 0;
    
    for (const conceptIndex of conceptIndexes) {
        const layoutIndex = concepts.length;
        const angle = startAngle + (angleDelta * i);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        pushConcept(
            concepts,
            {
                layoutIndex,
                conceptIndex,
                position: createPoint(x, y * verticalScale, 0),
            },
            conceptToLayoutIndexesMapping,
            layoutToConceptIndexesMapping);

        i++;
    }
}

function pushConcept(
    concepts: Array<ExplorerConcept>,
    concept: ExplorerConcept,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutToConceptIndexesMapping: Map<number, number>,
) {
    concepts.push(concept);
    conceptToLayoutIndexesMapping.set(concept.conceptIndex, concept.layoutIndex);
    layoutToConceptIndexesMapping.set(concept.layoutIndex, concept.conceptIndex);
}