import { FormalConcept } from "../types/FormalConcepts";

export function assignNodesToLayersByLongestPath(startConcept: FormalConcept, coverRelation: ReadonlyArray<Set<number>>) {
    const layersMapping = new Array<number>(coverRelation.length);
    const layers = new Array<Set<number>>();
    const visited = new Array<boolean>(coverRelation.length);

    const topologicalOrder = Array<number>(coverRelation.length);
    let sortedLastIndex = coverRelation.length - 1;

    topologicalSort(startConcept.index);

    // https://en.wikipedia.org/wiki/Longest_path_problem#Acyclic_graphs
    function topologicalSort(currentIndex: number) {
        const subconcepts = coverRelation[currentIndex];
        visited[currentIndex] = true;

        for (const subconceptIndex of subconcepts) {
            if (!visited[subconceptIndex]) {
                topologicalSort(subconceptIndex);
            }
        }

        topologicalOrder[sortedLastIndex] = currentIndex;
        sortedLastIndex--;
    }

    layersMapping[startConcept.index] = 0;
    layers[0] = new Set<number>();
    layers[0].add(startConcept.index);

    for (const orderedIndex of topologicalOrder) {
        const subconcepts = coverRelation[orderedIndex];
        const newLayer = layersMapping[orderedIndex] + 1;

        for (const subconceptIndex of subconcepts.values()) {
            if (layersMapping[subconceptIndex] === undefined || newLayer > layersMapping[subconceptIndex]) {
                if (layers[newLayer] === undefined) {
                    layers[newLayer] = new Set<number>();
                }
                if (layersMapping[subconceptIndex] !== undefined) {
                    // Remove the concept from its layer
                    layers[layersMapping[subconceptIndex]].delete(subconceptIndex);
                }

                layersMapping[subconceptIndex] = newLayer;
                // Add the concept to its new layer
                layers[newLayer].add(subconceptIndex);
            }
        }
    }

    return {
        layersMapping,
        layers,
    };
}