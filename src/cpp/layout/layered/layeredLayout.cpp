#include "../../utils.h"
#include "../../types/TimedResult.h"
#include "../utils.h"
#include "../layers.h"
#include "dummies.h"
#include "layeredLayout.h"
#include "placement.h"

#include <stdio.h>
#include <iostream>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>
#include <functional>

void calculateAveragePositionsOfLayer(
    std::vector<int>& layer,
    std::vector<float>& averages,
    std::vector<std::unordered_set<int>>& firstMapping,
    std::vector<std::unordered_set<int>>& secondMapping,
    std::vector<int>& horizontalPositions,
    bool useBoth
) {
    for (int node : layer)
    {
        int sum = 0;
        int count = 0;

        for (int subnode : firstMapping[node])
            sum += horizontalPositions[subnode];

        count += firstMapping[node].size();

        if (useBoth)
        {
            for (int subnode : secondMapping[node])
                sum += horizontalPositions[subnode];

            count += secondMapping[node].size();
        }

        averages[node] = (float)sum / count;
    }
}

std::unique_ptr<std::vector<std::vector<int>>> reduceCrossingsUsingAverage(
    std::vector<std::vector<int>>& layers,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& firstMapping,
    std::vector<std::unordered_set<int>>& secondMapping,
    bool topToBottom,
    bool useBoth
) {
    // This algorithm assumes that there are equal spaces between nodes in a layer
    // and that each layer is aligned with the center vertical axis 

    auto reducedLayers = std::make_unique<std::vector<std::vector<int>>>();
    reducedLayers->resize(layers.size());
    // Buffer for computed average positions
    std::vector<float> averages;
    averages.resize(horizontalPositions.size());

    // Starting points
    int first = topToBottom ? 0 : layers.size() - 1;
    int second = topToBottom ? 1 : layers.size() - 2;
    int increase = topToBottom ? 1 : -1;

    // First layer is fixed
    (*reducedLayers)[first].insert((*reducedLayers)[first].begin(), layers[first].begin(), layers[first].end());
    if (layers.size() > 1) {
        (*reducedLayers)[second].insert((*reducedLayers)[second].begin(), layers[second].begin(), layers[second].end());
    }

    for (int i = second; i < layers.size() && i >= 0; i += increase) {
        std::vector<int>& layer = layers[i];

        // Compute average position for each node in the layer
        calculateAveragePositionsOfLayer(
            layer,
            averages,
            firstMapping,
            secondMapping,
            horizontalPositions,
            useBoth);

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
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    std::vector<std::vector<int>>& layers,
    std::function<void(
        std::vector<float>&,
        std::vector<std::vector<int>>&,
        std::vector<std::unordered_set<int>>&,
        std::vector<std::unordered_set<int>>&,
        int
    )> placement
) {
    result.value.resize(conceptsCount * COORDS_COUNT);
    placement(result.value, layers, subconceptsMapping, superconceptsMapping, conceptsCount);
}

void computeLayeredLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    long long startTime = nowMills();

    // The layers are ordered from top to bottom – the first layer is at the top
    auto layersResult = assignNodesToLayersByLongestPath(supremum, subconceptsMapping);
    auto& [layersMapping, layers] = *layersResult;

    auto dummiesResult = addDummies(
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping,
        layers,
        layersMapping);
    auto& [layersWithDummies, horizontalPositions] = *dummiesResult;

    auto orderedLayers = reduceCrossingsUsingAverage(
        layersWithDummies,
        horizontalPositions,
        superconceptsMapping,
        subconceptsMapping,
        true,
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        *orderedLayers,
        horizontalPositions,
        subconceptsMapping,
        superconceptsMapping,
        false,
        false);
    orderedLayers = reduceCrossingsUsingAverage(
        *orderedLayers,
        horizontalPositions,
        superconceptsMapping,
        subconceptsMapping,
        true,
        true);

    long long endTime = nowMills();

    createLayout(
        result,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping,
        *orderedLayers,
        bkPlacement);

    result.time = (int)endTime - startTime;
}
