#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>
#include "layers.h"
#include "utils.h"

std::unique_ptr<std::tuple<std::vector<int>, std::vector<std::unordered_set<int>>>> assignNodesToLayersByLongestPath(
    int startConceptIndex,
    std::vector<std::unordered_set<int>>& coverRelation
) {
    auto result = std::make_unique<std::tuple<std::vector<int>, std::vector<std::unordered_set<int>>>>();
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
