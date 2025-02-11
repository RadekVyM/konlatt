import { ConceptLattice } from "../../types/ConceptLattice";
import { ConceptLatticeLayout } from "../../types/ConceptLatticeLayout";
import { FormalConcepts, getSupremum } from "../../types/FormalConcepts";
import { Point } from "../../types/Point";

export function computeLayeredLayout(formalConcepts: FormalConcepts, lattice: ConceptLattice): ConceptLatticeLayout {
    const layout = new Array<Point>(lattice.subconceptsMapping.length);

    assignNodesToLayersByLongestPath(formalConcepts, lattice.subconceptsMapping);

    return layout;
}

function assignNodesToLayersByLongestPath(formalConcepts: FormalConcepts, subconceptsMapping: ReadonlyArray<Set<number>>) {
    const layersMapping = new Array<number>(subconceptsMapping.length);
    const layers = new Array<Set<number>>(subconceptsMapping.length);
    const visited = new Array<boolean>(subconceptsMapping.length);
    const supremum = getSupremum(formalConcepts);

    layersMapping[supremum.index] = 0;
    layers[0] = new Set<number>();
    layers[0].add(supremum.index);

    dfs(supremum.index);

    // computing topological order and longest paths at the same time
    // https://en.wikipedia.org/wiki/Longest_path_problem#Acyclic_graphs
    function dfs(currentIndex: number) {
        const subconcepts = subconceptsMapping[currentIndex];
        visited[currentIndex] = true;

        for (const subconceptIndex of subconcepts) {
            if (!visited[subconceptIndex]) {
                dfs(subconceptIndex);
            }
            
            const newLayer = layersMapping[currentIndex] + 1;

            if (layersMapping[subconceptIndex] === undefined || newLayer > layersMapping[subconceptIndex]) {
                layersMapping[subconceptIndex] = newLayer;

                if (layers[newLayer] === undefined) {
                    layers[newLayer] = new Set<number>();
                }
                if (layersMapping[subconceptIndex] === undefined) {
                    // Remove the concept from it's layer
                    layers[layersMapping[currentIndex]].delete(currentIndex);
                }
                
                // Add the concept to it's new layer
                layers[newLayer].add(subconceptIndex);
            }
        }
    }

    return {
        layersMapping,
        layers,
    };
}