import { ConceptLattice } from "../../types/ConceptLattice";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { FormalConcepts } from "../../types/FormalConcepts";
import { createPoint, Point } from "../../types/Point";
import { assignNodesToLayersByLongestPath } from "./layers";

export function computeLayeredLayout(formalConcepts: FormalConcepts, lattice: ConceptLattice): ConceptLatticeLayout {
    const { layers } = assignNodesToLayersByLongestPath(formalConcepts, lattice.subconceptsMapping);

    // create dummy nodes

    // reduce crossing

    // assign coordinates properly

    return createLayout(lattice, layers);
}

function createLayout(lattice: ConceptLattice, layers: Array<Set<number>>) {
    const layout = new Array<Point>(lattice.subconceptsMapping.length);

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];

        let j = 0;
        for (const node of layer.values()) {
            layout[node] = createPoint(j * 20, i * 20, 0);
            j++;
        }
    }

    return layout;
}