import { Relation } from "../types/Relation";

/**
 * Assigns nodes of a DAG to layers using the longest path method.
 * @param startNodeIndex - The index of the root or starting node.
 * @param coverRelation - An adjacency list representing the DAG.
 * @returns An object containing:
 * - `layersMapping`: An array where the index is the node ID and the value is its layer depth.
 * - `layers`: An array of `Set`s, where each `Set` contains the node indices belonging to a specific layer.
 */
export function assignNodesToLayersByLongestPath(startNodeIndex: number, coverRelation: Relation) {
    const layersMapping = new Array<number>(coverRelation.length);
    const layers = new Array<Set<number>>();

    const topologicalOrder = topologicalSort(
        startNodeIndex,
        coverRelation);

    // Initialize the root at the first layer
    layersMapping[startNodeIndex] = 0;
    layers[0] = new Set<number>();
    layers[0].add(startNodeIndex);

    for (const orderedIndex of topologicalOrder) {
        const subnodes = coverRelation[orderedIndex];
        const newLayer = layersMapping[orderedIndex] + 1;

        for (const subnodeIndex of subnodes.values()) {
            // If subnod hasn't been layered, or if we found a longer path to it
            if (layersMapping[subnodeIndex] === undefined || newLayer > layersMapping[subnodeIndex]) {
                if (layers[newLayer] === undefined) {
                    layers[newLayer] = new Set<number>();
                }
                if (layersMapping[subnodeIndex] !== undefined) {
                    // Remove the node from its layer
                    layers[layersMapping[subnodeIndex]].delete(subnodeIndex);
                }

                layersMapping[subnodeIndex] = newLayer;
                // Add the node to its new layer
                layers[newLayer].add(subnodeIndex);
            }
        }
    }

    return {
        layersMapping,
        layers,
    };
}

function topologicalSort(startConceptIndex: number, coverRelation: Relation) {
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
    coverRelation: Relation,
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