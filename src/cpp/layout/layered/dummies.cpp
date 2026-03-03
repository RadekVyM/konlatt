#include "../../utils.h"
#include "../../types/ProgressData.h"

#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>

void addEdgeToRelation(std::unordered_map<int, std::vector<int>> & relation, int from, int to) {
    if (relation.count(from) == 1) {
        std::vector<int>& subconcepts = relation[from];
        subconcepts.push_back(to);
    }
    else {
        relation.insert({ from, { to } });
    }
}

void addDummiesToLayers(
    int conceptsCount,
    const std::vector<std::unordered_set<int>>& subconceptsRelation,
    const std::vector<int>& layersMapping,
    std::vector<int>& horizontalPositions,
    std::vector<std::vector<int>>& layersWithDummies,
    std::unordered_map<int, std::vector<int>>& dummySubconceptsRelation,
    std::unordered_map<int, std::vector<int>>& subconceptsToRemove,
    std::unordered_map<int, std::vector<int>>& dummySuperconceptsRelation,
    std::unordered_map<int, std::vector<int>>& superconceptsToRemove,
    ProgressData& progress
) {
    progress.beginBlock(subconceptsRelation.size());

    int newDummy = conceptsCount;

    for (int from = 0; from < subconceptsRelation.size(); from++) {
        int fromLayer = layersMapping[from];

        for (int to : subconceptsRelation[from]) {
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

                addEdgeToRelation(dummySubconceptsRelation, previousSuperconcept, newDummy);
                addEdgeToRelation(dummySuperconceptsRelation, newDummy, previousSuperconcept);

                previousSuperconcept = newDummy;
                newDummy++;
            }

            addEdgeToRelation(dummySubconceptsRelation, previousSuperconcept, to);
            addEdgeToRelation(dummySuperconceptsRelation, to, previousSuperconcept);

            addEdgeToRelation(subconceptsToRemove, from, to);
            addEdgeToRelation(superconceptsToRemove, to, from);
        }

        progress.progress(from + 1);
    }

    progress.finishBlock();
}

void mergeRelations(
    std::vector<std::unordered_set<int>>& relation,
    std::unordered_map<int, std::vector<int>>& dummyRelation
) {
    for (const auto& [concept, children] : dummyRelation) {
        for (auto child : children) {
            relation[concept].insert(child);
        }
    }
}

void removeEdgesFromRelation(
    std::vector<std::unordered_set<int>>& relation,
    std::unordered_map<int, std::vector<int>>& edgesToRemove
) {
    for (const auto& [concept, children] : edgesToRemove) {
        for (auto child : children) {
            relation[concept].erase(child);
        }
    }
}

std::unique_ptr<std::tuple<
    std::vector<std::vector<int>>,
    std::vector<int>
>> addDummies(
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    std::vector<std::unordered_set<int>>& layers,
    const std::vector<int>& layersMapping,
    ProgressData& progress
) {
    auto result = std::make_unique<std::tuple<
        std::vector<std::vector<int>>,
        std::vector<int>>>();
    auto& [layersWithDummies, horizontalPositions] = *result;

    std::unordered_map<int, std::vector<int>> dummySubconceptsRelation;
    std::unordered_map<int, std::vector<int>> subconceptsToRemove;
    std::unordered_map<int, std::vector<int>> dummySuperconceptsRelation;
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
        subconceptsRelation,
        layersMapping,
        horizontalPositions,
        layersWithDummies,
        dummySubconceptsRelation,
        subconceptsToRemove,
        dummySuperconceptsRelation,
        superconceptsToRemove,
        progress);

    // Add dummies to the cover relation
    subconceptsRelation.resize(horizontalPositions.size());
    superconceptsRelation.resize(horizontalPositions.size());
    mergeRelations(subconceptsRelation, dummySubconceptsRelation);
    mergeRelations(superconceptsRelation, dummySuperconceptsRelation);

    // Remove the transitive relations
    removeEdgesFromRelation(subconceptsRelation, subconceptsToRemove);
    removeEdgesFromRelation(superconceptsRelation, superconceptsToRemove);

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