import { ExplorerConcept } from "../../types/explorer/ExplorerConcept";
import { createPoint } from "../../types/Point";
import { withFallback } from "../../utils/stores";
import { ExplorerStore } from "./useExplorerStore";
import withLayoutBox from "./withLayoutBox";

/**
 * Calculates the spatial layout of explorer concepts. It maps a selected concept and its related super/sub-concepts
 * onto a 2D plane, arranging related nodes in semi-circular patterns above and below the selection.
 */
export default function withExplorerConcepts(newState: Partial<ExplorerStore>, oldState: ExplorerStore): Partial<ExplorerStore> {
    const lattice = withFallback(newState.lattice, oldState.lattice);
    const selectedConceptIndex = withFallback(newState.selectedConceptIndex, oldState.selectedConceptIndex);

    if (lattice === null || selectedConceptIndex === null) {
        return withLayoutBox(newState, oldState);
    }

    const superconcepts = lattice.superconceptsRelation[selectedConceptIndex];
    const subconcepts = lattice.subconceptsRelation[selectedConceptIndex];

    const conceptToLayoutIndexesMapping = new Map<number, number>();
    const layoutToConceptIndexesMapping = new Map<number, number>();
    const concepts = new Array<ExplorerConcept>();

    // Place the primary selected concept at the origin (0, 0)
    pushConcept(
        concepts,
        {
            layoutIndex: 0,
            conceptIndex: selectedConceptIndex,
            position: createPoint(0, 0, 0),
        },
        conceptToLayoutIndexesMapping,
        layoutToConceptIndexesMapping);

    // Arrange superconcepts in an upward arc (verticalScale: 1)
    pushConcepts(concepts, superconcepts, 1, conceptToLayoutIndexesMapping, layoutToConceptIndexesMapping);
    // Arrange subconcepts in a downward arc (verticalScale: -1)
    pushConcepts(concepts, subconcepts, -1, conceptToLayoutIndexesMapping, layoutToConceptIndexesMapping);

    return withLayoutBox({
        ...newState,
        concepts,
        conceptToLayoutIndexesMapping,
        layoutToConceptIndexesMapping,
    }, oldState);
}

/** Places the concepts around the circumference of a semi-circle. */
function pushConcepts(
    concepts: Array<ExplorerConcept>,
    conceptIndexes: ReadonlySet<number>,
    verticalScale: number,
    conceptToLayoutIndexesMapping: Map<number, number>,
    layoutToConceptIndexesMapping: Map<number, number>,
) {
    if (concepts.length === 0) {
        return;
    }

    const nodesDistance = 1.2;
    // Calculate radius based on the number of nodes to maintain consistent spacing
    const halfCircumference = (conceptIndexes.size + 1) * nodesDistance;
    const radius = Math.max(halfCircumference / Math.PI, 1);

    // Distribute angles evenly across PI radians (180 degrees)
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

/**
 * Helper to synchronize the concepts array and the bidirectional index maps.
 */
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