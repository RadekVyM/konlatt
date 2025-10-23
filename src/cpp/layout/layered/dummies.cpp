#include "../../utils.h"
#include "../../types/ProgressData.h"

#include <stdio.h>
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
    std::unordered_map<int, std::vector<int>>& superconceptsToRemove,
    ProgressData& progress
) {
    progress.beginBlock(subconceptsMapping.size());

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

        progress.progress(from + 1);
    }

    progress.finishBlock();
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
    const std::vector<int>& layersMapping,
    ProgressData& progress
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
        superconceptsToRemove,
        progress);

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