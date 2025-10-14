#include "../utils.h"
#include "../types/TimedResult.h"
#include "utils.h"
#include "layers.h"
#include "layeredLayout.h"

#include <stdio.h>
#include <iostream>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>

void addSubconceptToMapping(std::unordered_map<int, std::vector<int>> & subconceptsMapping, int superconcept, int subconcept) {
    if (subconceptsMapping.count(superconcept) == 1) {
        std::vector<int>& subconcepts = subconceptsMapping[superconcept];
        subconcepts.push_back(subconcept);
    }
    else {
        subconceptsMapping.insert({ superconcept, { subconcept } });
    }
}

void addDummiesToLayers(
    int conceptsCount,
    const std::vector<std::unordered_set<int>>& subconceptsMapping,
    const std::vector<int>& layersMapping,
    std::vector<int>& horizontalPositions,
    std::vector<std::vector<int>>& layersWithDummies,
    std::unordered_map<int, std::vector<int>>& dummySubconceptsMapping,
    std::unordered_map<int, std::vector<int>>& subconceptsToRemove,
    std::unordered_map<int, std::vector<int>>& dummySuperconceptsMapping,
    std::unordered_map<int, std::vector<int>>& superconceptsToRemove
) {
    int newDummy = conceptsCount;

    for (int from = 0; from < subconceptsMapping.size(); from++) {
        int fromLayer = layersMapping[from];

        for (int to : subconceptsMapping[from]) {
            int toLayer = layersMapping[to];
            int diff = abs(toLayer - fromLayer);

            if (diff <= 1) {
                // The layers are neighboring, no dummies need to be added
                continue;
            }

            // Dummies need to be added 
            int previousSuperconcept = from;

            for (int i = 1; i <= diff - 1; i++) {
                float ratio = (float)i / (toLayer - fromLayer);
                int newDummyHorizontalPosition = (int)round(
                    (ratio * (horizontalPositions[to] - horizontalPositions[from])) + horizontalPositions[from]);
                std::vector<int>& targetLayer = layersWithDummies[fromLayer + i];

                // TODO: this part is weird and causes problems
                // different behavior of C++ datastructures (probably) causes problems overall
                if (newDummyHorizontalPosition + 1 > targetLayer.size()) {
                    targetLayer.push_back(newDummy);
                }
                else {
                    targetLayer.insert(targetLayer.begin() + newDummyHorizontalPosition, newDummy);
                }
                horizontalPositions.push_back(newDummyHorizontalPosition);

                // Move nodes that follow the newly inserted dummy
                for (int j = newDummyHorizontalPosition + 1; j < targetLayer.size(); j++) {
                    horizontalPositions[targetLayer[j]]++;
                }

                addSubconceptToMapping(dummySubconceptsMapping, previousSuperconcept, newDummy);
                addSubconceptToMapping(dummySuperconceptsMapping, newDummy, previousSuperconcept);

                previousSuperconcept = newDummy;
                newDummy++;
            }

            addSubconceptToMapping(dummySubconceptsMapping, previousSuperconcept, to);
            addSubconceptToMapping(dummySuperconceptsMapping, to, previousSuperconcept);

            addSubconceptToMapping(subconceptsToRemove, from, to);
            addSubconceptToMapping(superconceptsToRemove, to, from);
        }
    }
}

void mergeMappings(
    std::vector<std::unordered_set<int>>& mapping,
    std::unordered_map<int, std::vector<int>>& dummyMapping
) {
    for (const auto& [concept, subconcepts] : dummyMapping) {
        for (auto subconcept : subconcepts) {
            mapping[concept].insert(subconcept);
        }
    }
}

void removeNodesFromMapping(
    std::vector<std::unordered_set<int>>& mapping,
    std::unordered_map<int, std::vector<int>>& nodesToRemove
) {
    for (const auto& [node, subnodes] : nodesToRemove) {
        for (auto subnode : subnodes) {
            mapping[node].erase(subnode);
        }
    }
}

std::unique_ptr<std::tuple<
    std::vector<std::vector<int>>,
    std::vector<int>
>> addDummies(
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    std::vector<std::unordered_set<int>>& layers,
    const std::vector<int>& layersMapping
) {
    auto result = std::make_unique<std::tuple<
        std::vector<std::vector<int>>,
        std::vector<int>>>();
    auto& [layersWithDummies, horizontalPositions] = *result;

    std::unordered_map<int, std::vector<int>> dummySubconceptsMapping;
    std::unordered_map<int, std::vector<int>> subconceptsToRemove;
    std::unordered_map<int, std::vector<int>> dummySuperconceptsMapping;
    std::unordered_map<int, std::vector<int>> superconceptsToRemove;

    horizontalPositions.resize(conceptsCount);
    layersWithDummies.resize(layers.size());

    int maxLayerSize = maxSizeOfSets(layers);

    for (int i = 0; i < layers.size(); i++) {
        std::unordered_set<int>& layer = layers[i];
        float offset = (float)(maxLayerSize - layer.size()) / 2;

        // Set initial horizontal positions of the nodes in the current layer,
        // so that the layer is aligned with the center vertical axis
        int j = 0;
        for (auto value : layer) {
            horizontalPositions[value] = j + offset;
            j++;
        }

        // Copy the current layer to the new collection that will contain dummies too
        layersWithDummies[i].insert(layersWithDummies[i].end(), layer.begin(), layer.end());
    }

    addDummiesToLayers(
        conceptsCount,
        subconceptsMapping,
        layersMapping,
        horizontalPositions,
        layersWithDummies,
        dummySubconceptsMapping,
        subconceptsToRemove,
        dummySuperconceptsMapping,
        superconceptsToRemove);

    // Add dummies to the cover relation mappings
    subconceptsMapping.resize(horizontalPositions.size());
    superconceptsMapping.resize(horizontalPositions.size());
    mergeMappings(subconceptsMapping, dummySubconceptsMapping);
    mergeMappings(superconceptsMapping, dummySuperconceptsMapping);

    // Remove the transitive relations from the mappings
    removeNodesFromMapping(subconceptsMapping, subconceptsToRemove);
    removeNodesFromMapping(superconceptsMapping, superconceptsToRemove);

    // Make the coords precise
    int maxWithDummies = maxSizeOfVectors(layersWithDummies);

    for (int i = 0; i < layersWithDummies.size(); i++) {
        std::unordered_set<int>& layer = layers[i];
        float offset = (float)(maxWithDummies - layer.size()) / 2;
        int j = 0;

        // Set correct horizontal positions of the nodes in the current layer,
        // so that the layer is aligned with the center vertical axis
        for (auto value : layer) {
            horizontalPositions[value] = j + offset;
            j++;
        }
    }

    return result;
}

std::unique_ptr<std::vector<std::vector<int>>> reduceCrossingsUsingAverage(
    int conceptsCount,
    std::vector<std::vector<int>>& layers,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& firstMapping,
    std::vector<std::unordered_set<int>>& secondMapping,
    bool topToBottom,
    bool useBoth
) {
    auto reducedLayers = std::make_unique<std::vector<std::vector<int>>>();
    std::vector<float> averages;
    int first = topToBottom ? 0 : layers.size() - 1;
    int second = topToBottom ? 1 : layers.size() - 2;
    int increase = topToBottom ? 1 : -1;

    averages.resize(horizontalPositions.size());
    reducedLayers->resize(layers.size());

    (*reducedLayers)[first].insert((*reducedLayers)[first].begin(), layers[first].begin(), layers[first].end());
    if (layers.size() > 1) {
        (*reducedLayers)[second].insert((*reducedLayers)[second].begin(), layers[second].begin(), layers[second].end());
    }

    for (int i = second; i < layers.size() && i >= 0; i += increase) {
        std::vector<int>& layer = layers[i];

        for (int node : layer) {
            int sum = 0;
            int count = 0;

            // TODO: redundant code
            for (int subconcept : firstMapping[node]) {
                sum += horizontalPositions[subconcept];
            }

            count += firstMapping[node].size();

            if (useBoth) {
                for (int subconcept : secondMapping[node]) {
                    sum += horizontalPositions[subconcept];
                }

                count += secondMapping[node].size();
            }

            averages[node] = (float)sum / count;
        }

        auto& reducedLayer = (*reducedLayers)[i] = std::vector<int>(layer.begin(), layer.end());
        int offset = horizontalPositions[layer[0]];

        // Future self, be aware of the strict weak ordering! You are welcome!
        std::sort(reducedLayer.begin(), reducedLayer.end(), [&](int a, int b) {
            return averages[a] < averages[b];
        });

        for (int j = 0; j < reducedLayer.size(); j++) {
            horizontalPositions[reducedLayer[j]] = j + offset;
        }
    }

    return reducedLayers;
}

void createLayout(
    TimedResult<std::vector<float>>& result,
    int conceptsCount,
    std::vector<std::vector<int>>& layers
) {
    result.value.resize(conceptsCount * COORDS_COUNT);
    float top = (float)(layers.size() - 1) / -2;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        float left = (float)(layer.size() - 1) / -2;

        for (int node : layer) {
            if (node < conceptsCount) {
                setX(result.value, node, left);
                setY(result.value, node, -top);
                setZ(result.value, node, 0);
            }
            left += 1;
        }

        top += 1;
    }
}

void computeLayeredLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    long long startTime = nowMills();

    auto layersResult = assignNodesToLayersByLongestPath(supremum, subconceptsMapping);
    auto& [layersMapping, layers] = *layersResult;

    auto dummiesResult = addDummies(
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping,
        layers,
        layersMapping);
    auto& [layersWithDummies, horizontalCoords] = *dummiesResult;

    auto orderedLayers = reduceCrossingsUsingAverage(
        conceptsCount,
        layersWithDummies,
        horizontalCoords,
        superconceptsMapping,
        subconceptsMapping,
        true,
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        conceptsCount,
        *orderedLayers,
        horizontalCoords,
        subconceptsMapping,
        superconceptsMapping,
        false,
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        conceptsCount,
        *orderedLayers,
        horizontalCoords,
        superconceptsMapping,
        subconceptsMapping,
        true,
        true);

    long long endTime = nowMills();

    createLayout(result, conceptsCount, *orderedLayers);
    result.time = (int)endTime - startTime;
}
