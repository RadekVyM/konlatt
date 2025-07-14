#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>
#include "layers.h"

using namespace std;

void topologicalSortImpl(
    int currentIndex,
    std::vector<std::unordered_set<int>>& coverRelation,
    std::vector<bool>& visited,
    std::vector<int>& topologicalOrder,
    std::shared_ptr<int> sortedLastIndex
) {
    // https://en.wikipedia.org/wiki/Longest_path_problem#Acyclic_graphs

    std::unordered_set<int>& subconcepts = coverRelation[currentIndex];
    visited[currentIndex] = true;

    for (int subconceptIndex : subconcepts) {
        if (!visited[subconceptIndex]) {
            topologicalSortImpl(
                subconceptIndex,
                coverRelation,
                visited,
                topologicalOrder,
                sortedLastIndex);
        }
    }

    topologicalOrder[*sortedLastIndex] = currentIndex;
    *sortedLastIndex = *sortedLastIndex - 1;
}

std::unique_ptr<std::vector<int>> topologicalSort(int startConceptIndex, std::vector<std::unordered_set<int>>& coverRelation) {
    std::unique_ptr<std::vector<int>> topologicalOrder = make_unique<std::vector<int>>();
    std::unique_ptr<std::vector<bool>> visited = make_unique<std::vector<bool>>();
    std::shared_ptr<int> sortedLastIndex = make_shared<int>();

    visited->resize(coverRelation.size());
    topologicalOrder->resize(coverRelation.size());
    *sortedLastIndex = coverRelation.size() - 1;

    topologicalSortImpl(
        startConceptIndex,
        coverRelation,
        *visited,
        *topologicalOrder,
        sortedLastIndex);

    return topologicalOrder;
}

std::unique_ptr<std::tuple<std::vector<int>, std::vector<std::unordered_set<int>>>> assignNodesToLayersByLongestPath(
    int startConceptIndex,
    std::vector<std::unordered_set<int>>& coverRelation
) {
    auto result = make_unique<std::tuple<std::vector<int>, std::vector<std::unordered_set<int>>>>();
    auto& [layersMapping, layers] = *result;

    layersMapping.resize(coverRelation.size(), -1);

    std::unique_ptr<std::vector<int>> topologicalOrder = topologicalSort(
        startConceptIndex,
        coverRelation);

    layersMapping[startConceptIndex] = 0;
    layers.push_back(std::unordered_set<int>());
    layers[0].insert(startConceptIndex);

    for (int orderedIndex : *topologicalOrder) {
        std::unordered_set<int>& subconcepts = coverRelation[orderedIndex];
        int newLayer = layersMapping[orderedIndex] + 1;

        for (int subconceptIndex : subconcepts) {
            if (layersMapping[subconceptIndex] == -1 || newLayer > layersMapping[subconceptIndex]) {
                if (layers.size() < newLayer + 1) {
                    layers.resize(newLayer + 1);
                }
                if (layersMapping[subconceptIndex] != -1) {
                    // Remove the concept from its layer
                    layers[layersMapping[subconceptIndex]].erase(subconceptIndex);
                }

                layersMapping[subconceptIndex] = newLayer;
                // Add the concept to its new layer
                layers[newLayer].insert(subconceptIndex);
            }
        }
    }

    return result;
}
