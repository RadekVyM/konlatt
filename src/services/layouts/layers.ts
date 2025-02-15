import { FormalConcepts, getSupremum } from "../../types/FormalConcepts";

export function assignNodesToLayersByLongestPath(formalConcepts: FormalConcepts, subconceptsMapping: ReadonlyArray<Set<number>>) {
    const layersMapping = new Array<number>(subconceptsMapping.length);
    const layers = new Array<Set<number>>();
    const visited = new Array<boolean>(subconceptsMapping.length);
    const supremum = getSupremum(formalConcepts);

    const topologicalOrder = Array<number>(subconceptsMapping.length);
    let sortedLastIndex = subconceptsMapping.length - 1;

    topologicalSort(supremum.index);

    // https://en.wikipedia.org/wiki/Longest_path_problem#Acyclic_graphs
    function topologicalSort(currentIndex: number) {
        const subconcepts = subconceptsMapping[currentIndex];
        visited[currentIndex] = true;

        for (const subconceptIndex of subconcepts) {
            if (!visited[subconceptIndex]) {
                topologicalSort(subconceptIndex);
            }
        }

        topologicalOrder[sortedLastIndex] = currentIndex;
        sortedLastIndex--;
    }

    layersMapping[supremum.index] = 0;
    layers[0] = new Set<number>();
    layers[0].add(supremum.index);

    for (const orderedIndex of topologicalOrder) {
        const subconcepts = subconceptsMapping[orderedIndex];
        const newLayer = layersMapping[orderedIndex] + 1;

        for (const subconceptIndex of subconcepts.values()) {
            if (layersMapping[subconceptIndex] === undefined || newLayer > layersMapping[subconceptIndex]) {
                if (layers[newLayer] === undefined) {
                    layers[newLayer] = new Set<number>();
                }
                if (layersMapping[subconceptIndex] !== undefined) {
                    // Remove the concept from it's layer
                    layers[layersMapping[subconceptIndex]].delete(subconceptIndex);
                }
                
                layersMapping[subconceptIndex] = newLayer;
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