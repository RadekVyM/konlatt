export function assignNodesToLayersByLongestPath(startConceptIndex: number, coverRelation: ReadonlyArray<Set<number>>) {
    const layersMapping = new Array<number>(coverRelation.length);
    const layers = new Array<Set<number>>();

    const topologicalOrder = topologicalSort(
        startConceptIndex,
        coverRelation);

    layersMapping[startConceptIndex] = 0;
    layers[0] = new Set<number>();
    layers[0].add(startConceptIndex);

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

function topologicalSort(startConceptIndex: number, coverRelation: ReadonlyArray<Set<number>>) {
    const visited = new Array<boolean>(coverRelation.length);
    const topologicalOrder = Array<number>(coverRelation.length);

    topologicalSortImpl(
        startConceptIndex,
        coverRelation,
        visited,
        topologicalOrder,
        { value: coverRelation.length - 1 });

    return topologicalOrder;
}

function topologicalSortImpl(
    currentIndex: number,
    coverRelation: ReadonlyArray<Set<number>>,
    visited: Array<boolean>,
    topologicalOrder: Array<number>,
    sortedLastIndex: { value: number }
) {
    // https://en.wikipedia.org/wiki/Longest_path_problem#Acyclic_graphs

    const subconcepts = coverRelation[currentIndex];
    visited[currentIndex] = true;

    for (const subconceptIndex of subconcepts) {
        if (!visited[subconceptIndex]) {
            topologicalSortImpl(
                subconceptIndex,
                coverRelation,
                visited,
                topologicalOrder,
                sortedLastIndex);
        }
    }

    topologicalOrder[sortedLastIndex.value] = currentIndex;
    sortedLastIndex.value--;
}