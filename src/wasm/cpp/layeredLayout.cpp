#include "utils.h"
#include "layers.h"
#include "TimedResult.h"
#include "layeredLayout.h"

#include <stdio.h>
#include <iostream>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>

#define CoordsCount 3

using namespace std;

void addSubconceptToMapping(std::unordered_map<int, std::vector<int>>& subconceptsMapping, int superconcept, int subconcept) {
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
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<int>& layersMapping,
    std::vector<int>& horizontalCoords,
    std::vector<std::vector<int>>& layersWithDummies,
    std::unordered_map<int, std::vector<int>>& dummySubconceptsMapping,
    std::unordered_map<int, std::vector<int>>& dummySuperconceptsMapping
) {
    int newDummy = conceptsCount;

    for (int from = 0; from < subconceptsMapping.size(); from++) {
        int fromLayer = layersMapping[from];

        for (int to : subconceptsMapping[from]) {
            int toLayer = layersMapping[to];
            int diff = abs(toLayer - fromLayer);

            if (diff > 1) {
                // add dummies 
                int previousSuperconcept = from;

                for (int i = 1; i <= diff - 1; i++) {
                    float ratio = (float)i / (toLayer - fromLayer);
                    int coord = (int)round((ratio * (horizontalCoords[to] - horizontalCoords[from])) + horizontalCoords[from]);
                    std::vector<int>& targetLayer = layersWithDummies[fromLayer + i];

                    // TODO: this part is weird and causes problems
                    // different behavior of C++ datastructures (probably) causes problems overall
                    if (coord + 1 > targetLayer.size()) {
                        targetLayer.push_back(newDummy);
                    }
                    else {
                        targetLayer.insert(targetLayer.begin() + coord, newDummy);
                    }
                    horizontalCoords.push_back(coord);

                    for (int j = coord + 1; j < targetLayer.size(); j++) {
                        horizontalCoords[targetLayer[j]]++;
                    }

                    addSubconceptToMapping(dummySubconceptsMapping, previousSuperconcept, newDummy);
                    addSubconceptToMapping(dummySuperconceptsMapping, newDummy, previousSuperconcept);

                    previousSuperconcept = newDummy;
                    newDummy++;
                }

                addSubconceptToMapping(dummySubconceptsMapping, previousSuperconcept, to);
                addSubconceptToMapping(dummySuperconceptsMapping, to, previousSuperconcept);
            }
        }
    }
}

std::unique_ptr<std::tuple<
    std::vector<std::vector<int>>,
    std::vector<int>,
    std::unordered_map<int, std::vector<int>>,
    std::unordered_map<int, std::vector<int>>
>> addDummies(
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& layers,
    std::vector<int>& layersMapping
) {
    auto result = make_unique<std::tuple<
        std::vector<std::vector<int>>,
        std::vector<int>,
        std::unordered_map<int, std::vector<int>>,
        std::unordered_map<int, std::vector<int>>>>();
    auto& [layersWithDummies, horizontalCoords, dummySubconceptsMapping, dummySuperconceptsMapping] = *result;

    horizontalCoords.resize(conceptsCount);
    layersWithDummies.resize(layers.size());

    int maxLayerSize = maxSizeOfSets(layers);

    for (int i = 0; i < layers.size(); i++) {
        std::unordered_set<int>& layer = layers[i];
        float offset = (float)(maxLayerSize - layer.size()) / 2;

        int j = 0;
        for (auto value : layer) {
            horizontalCoords[value] = j + offset;
            j++;
        }

        layersWithDummies[i].insert(layersWithDummies[i].end(), layer.begin(), layer.end());
    }

    addDummiesToLayers(
        conceptsCount,
        subconceptsMapping,
        layersMapping,
        horizontalCoords,
        layersWithDummies,
        dummySubconceptsMapping,
        dummySuperconceptsMapping);

    // Make the coords precise
    int maxWithDummies = maxSizeOfVectors(layersWithDummies);

    for (int i = 0; i < layersWithDummies.size(); i++) {
        std::unordered_set<int>& layer = layers[i];
        float offset = (float)(maxWithDummies - layer.size()) / 2;
        int j = 0;

        for (auto value : layer) {
            horizontalCoords[value] = j + offset;
            j++;
        }
    }

    return result;
}

std::unique_ptr<std::vector<std::vector<int>>> reduceCrossingsUsingAverage(
    int conceptsCount,
    std::vector<std::vector<int>>& layers,
    std::vector<int>& horizontalCoords,
    std::vector<std::unordered_set<int>>& firstMapping,
    std::vector<std::unordered_set<int>>& secondMapping,
    std::unordered_map<int, std::vector<int>>& firstDummyMapping,
    std::unordered_map<int, std::vector<int>>& secondDummyMapping,
    bool topToBottom,
    bool useBoth
) {
    auto reducedLayers = make_unique<std::vector<std::vector<int>>>();
    auto averages = make_unique<std::vector<float>>();
    int first = topToBottom ? 0 : layers.size() - 1;
    int second = topToBottom ? 1 : layers.size() - 2;
    int increase = topToBottom ? 1 : -1;

    averages->resize(horizontalCoords.size());
    reducedLayers->resize(layers.size());

    (*reducedLayers)[first].insert((*reducedLayers)[first].begin(), layers[first].begin(), layers[first].end());
    if (layers.size() > 1) {
        (*reducedLayers)[second].insert((*reducedLayers)[second].begin(), layers[second].begin(), layers[second].end());
    }

    for (int i = second; i < layers.size() && i >= 0; i += increase) {
        std::vector<int>& layer = layers[i];

        for (int concept : layer) {
            int sum = 0;
            int count = 0;

            if (concept < conceptsCount) {
                // TODO: redundant code
                for (int subconcept : firstMapping[concept]) {
                    sum += horizontalCoords[subconcept];
                }

                count += firstMapping[concept].size();

                if (useBoth) {
                    for (int subconcept : secondMapping[concept]) {
                        sum += horizontalCoords[subconcept];
                    }

                    count += secondMapping[concept].size();
                }
            }

            // TODO: redundant code
            if (firstDummyMapping.count(concept) > 0) {
                auto& subconcepts = firstDummyMapping[concept];

                for (int subconcept : subconcepts) {
                    sum += horizontalCoords[subconcept];
                }

                count += subconcepts.size();
            }

            if (useBoth && secondDummyMapping.count(concept) > 0) {
                auto& subconcepts = secondDummyMapping[concept];

                for (int subconcept : subconcepts) {
                    sum += horizontalCoords[subconcept];
                }

                count += subconcepts.size();
            }

            (*averages)[concept] = (float)sum / count;
        }

        auto& reducedLayer = (*reducedLayers)[i] = vector<int>(layer.begin(), layer.end());
        int offset = horizontalCoords[layer[0]];

        std::sort(reducedLayer.begin(), reducedLayer.end(), [&](int a, int b) {
            return (*averages)[a] <= (*averages)[b];
        });

        for (int j = 0; j < reducedLayer.size(); j++) {
            horizontalCoords[reducedLayer[j]] = j + offset;
        }
    }

    return reducedLayers;
}

std::unique_ptr<std::vector<float>> createLayout(int conceptsCount, std::vector<std::vector<int>>& layers) {
    auto layout = make_unique<std::vector<float>>();
    layout->resize(conceptsCount * CoordsCount);
    float top = (float)(layers.size() - 1) / -2;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        float left = (float)(layer.size() - 1) / -2;

        for (int node : layer) {
            if (node < conceptsCount) {
                int startNode = node * CoordsCount;
                (*layout)[startNode] = left;
                (*layout)[startNode + 1] = top;
                (*layout)[startNode + 2] = 0;
            }
            left += 1;
        }

        top += 1;
    }

    return layout;
}

TimedResult<std::vector<float>> computeLayeredLayout(
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
        layers,
        layersMapping);
    auto& [layersWithDummies, horizontalCoords, dummySuperconceptsMapping, dummySubconceptsMapping] = *dummiesResult;

    auto orderedLayers = reduceCrossingsUsingAverage(
        conceptsCount,
        layersWithDummies,
        horizontalCoords,
        superconceptsMapping,
        subconceptsMapping,
        dummySuperconceptsMapping,
        dummySubconceptsMapping,
        true,
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        conceptsCount,
        *orderedLayers,
        horizontalCoords,
        subconceptsMapping,
        superconceptsMapping,
        dummySubconceptsMapping,
        dummySuperconceptsMapping,
        false,
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        conceptsCount,
        *orderedLayers,
        horizontalCoords,
        superconceptsMapping,
        subconceptsMapping,
        dummySuperconceptsMapping,
        dummySubconceptsMapping,
        true,
        true);

    long long endTime = nowMills();

    return TimedResult<std::vector<float>>(*createLayout(conceptsCount, *orderedLayers), (int)endTime - startTime);
}
