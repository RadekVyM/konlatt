#include "../../utils.h"
#include "../../types/TimedResult.h"
#include "../../types/ProgressData.h"
#include "../utils.h"
#include "../layers.h"
#include "dummies.h"
#include "layeredLayout.h"
#include "placement.h"
#include "crossCount.h"

#include <stdio.h>
#include <iostream>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>
#include <functional>
#include <exception>

using PlacementDelegate = std::function<void(
    std::vector<float>&,
    std::vector<std::vector<int>>&,
    std::vector<std::unordered_set<int>>&,
    std::vector<std::unordered_set<int>>&,
    int,
    ProgressData&
)>;

#define MAX_ITERATIONS_COUNT 5

/**
 * Calculates the average horizontal position of neighbors for each node in a layer.
 * This is the core of the Barycenter heuristic to reduce edge crossings.
 */
void calculateAveragePositionsOfLayer(
    std::vector<int>& layer,
    std::vector<float>& averages,
    std::vector<std::unordered_set<int>>& firstRelation,
    std::vector<std::unordered_set<int>>& secondRelation,
    std::vector<int>& horizontalPositions,
    bool useBoth
) {
    for (int node : layer) {
        int sum = 0;
        int count = 0;

        // Calculate sum of positions of connected nodes in the adjacent layer
        for (int subnode : firstRelation[node])
            sum += horizontalPositions[subnode];

        count += firstRelation[node].size();

        // Optionally include neighbors from the other side as well
        if (useBoth) {
            for (int subnode : secondRelation[node])
                sum += horizontalPositions[subnode];

            count += secondRelation[node].size();
        }

        averages[node] = (count == 0) ? (float)horizontalPositions[node] : (float)sum / count;
    }
}

/**
 * Performs a single sweep (top-to-bottom or bottom-to-top) across all layers
 * to reorder nodes based on their barycenters.
 */
std::unique_ptr<std::vector<std::vector<int>>> applyBarycenterPass(
    std::vector<std::vector<int>>& layers,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& firstRelation,
    std::vector<std::unordered_set<int>>& secondRelation,
    bool topToBottom,
    bool useBoth,
    ProgressData& progress
) {
    // This algorithm assumes that there are equal spaces between nodes in a layer
    // and that each layer is aligned with the center vertical axis 

    progress.beginBlock(layers.size());

    auto reducedLayers = std::make_unique<std::vector<std::vector<int>>>();
    reducedLayers->resize(layers.size());
    // Buffer for computed average positions
    std::vector<float> averages;
    averages.resize(horizontalPositions.size());

    // Determine traversal direction
    int first = topToBottom ? 0 : layers.size() - 1;
    int second = topToBottom ? 1 : layers.size() - 2;
    int increase = topToBottom ? 1 : -1;

    // First layer is fixed
    (*reducedLayers)[first].insert((*reducedLayers)[first].begin(), layers[first].begin(), layers[first].end());
    if (layers.size() > 1) {
        (*reducedLayers)[second].insert((*reducedLayers)[second].begin(), layers[second].begin(), layers[second].end());
    }

    int iteration = 0;

    for (int i = second; i < layers.size() && i >= 0; i += increase) {
        std::vector<int>& layer = layers[i];

        // Compute average position for each node in the layer
        calculateAveragePositionsOfLayer(
            layer,
            averages,
            firstRelation,
            secondRelation,
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

        progress.progress(iteration + 1);
        iteration++;
    }

    progress.finishBlock();

    return reducedLayers;
}

/**
 * Orchestrates a full Barycenter "round": downward pass, upward pass, and a combined pass.
 */
std::unique_ptr<std::vector<std::vector<int>>> applyBarycenter(
    std::vector<std::vector<int>>& layersWithDummies,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    ProgressData& progress
) {
    // Top-to-bottom pass while taking only top neighbors into account
    auto orderedLayers = applyBarycenterPass(
        layersWithDummies,
        horizontalPositions,
        superconceptsRelation,
        subconceptsRelation,
        true,
        false,
        progress);
    // Bottom-to-top pass while taking only bottom neighbors into account
    orderedLayers = applyBarycenterPass(
        *orderedLayers,
        horizontalPositions,
        subconceptsRelation,
        superconceptsRelation,
        false,
        false,
        progress);
    // Top-to-bottom pass while taking all neighbors into account
    orderedLayers = applyBarycenterPass(
        *orderedLayers,
        horizontalPositions,
        superconceptsRelation,
        subconceptsRelation,
        true,
        true,
        progress);

    return orderedLayers;
}

/**
 * Iteratively reduces edge crossings by repeatedly applying the barycenter heuristic
 * until convergence or max iterations reached.
 */
std::unique_ptr<std::vector<std::vector<int>>> reduceCrossings(
    std::vector<std::vector<int>>& layersWithDummies,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    ProgressData& progress
) {
    CrossCountDataStructures crossCountDataStructures;

    auto bestOrderedLayers = applyBarycenter(
        layersWithDummies,
        horizontalPositions,
        subconceptsRelation,
        superconceptsRelation,
        progress);

    int iteration = 0;

    try {
        long long bestCount = crossCount(*bestOrderedLayers, horizontalPositions, subconceptsRelation, crossCountDataStructures);
        long long lastCount = bestCount;
        std::unique_ptr<std::vector<std::vector<int>>> lastOrderedLayers = nullptr;

        for (int i = 0; i < MAX_ITERATIONS_COUNT; i++) {
            if (bestCount == 0) {
                break;
            }

            lastOrderedLayers = std::move(applyBarycenter(
                lastOrderedLayers == nullptr ? *bestOrderedLayers : *lastOrderedLayers,
                horizontalPositions,
                subconceptsRelation,
                superconceptsRelation,
                progress));

            long long newCount = crossCount(*lastOrderedLayers, horizontalPositions, subconceptsRelation, crossCountDataStructures);

            iteration++;

            if (newCount >= lastCount || newCount < 0) {
                break;
            }

            lastCount = newCount;

            if (newCount < bestCount) {
                bestCount = newCount;
                bestOrderedLayers = std::move(lastOrderedLayers);
            }
        }
    }
    // If an exception occurs during subsequent crossing reduction attempts,
    // ignore it, do not be greedy and take the first result.
    catch (const std::exception& e) {
        std::cerr << "An exception occurred during layered diagram computation: " << e.what() << std::endl;
    }
    catch (...) {
        std::cerr << "An exception occurred during layered diagram computation." << std::endl;
    }

    if (iteration < MAX_ITERATIONS_COUNT) {
        progress.finishBlocks((MAX_ITERATIONS_COUNT - iteration) * 3);
    }

    return bestOrderedLayers;
}

/**
 * Final step: maps the logical layer/node structure into actual float coordinates.
 */
void createLayout(
    TimedResult<std::vector<float>>& result,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    std::vector<std::vector<int>>& layers,
    ProgressData& progress,
    PlacementDelegate placement
) {
    result.value.resize(conceptsCount * COORDS_COUNT);
    placement(result.value, layers, subconceptsRelation, superconceptsRelation, conceptsCount, progress);
}

/**
 * Factory for selecting coordinate assignment algorithms (e.g., Brandes-Köpf).
 */
PlacementDelegate getPlacementFunc(std::string placement) {
    if (placement == "bk") {
        return bkPlacement;
    }
    if (placement == "ellipse") {
        return ellipsePlacement;
    }
    return simplePlacement;
}

/**
 * Main entry point for the layered layout computation.
 */
void computeLayeredLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    std::string placement,
    std::function<void(double)> onProgress
) {
    long long startTime = nowMills();

    auto progress = ProgressData(
        1 + (3 * (MAX_ITERATIONS_COUNT + 1)) + (placement == "bk" ? (1 + (2 * 4) + 1 + 1) : 0),
        onProgress);

    // The layers are ordered from top to bottom – the first layer is at the top
    auto layersResult = assignNodesToLayersByLongestPath(supremum, subconceptsRelation);
    auto& [layersMapping, layers] = *layersResult;

    // Add dummy nodes for edges spanning multiple layers
    auto dummiesResult = addDummies(
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        layers,
        layersMapping,
        progress);
    auto& [layersWithDummies, horizontalPositions] = *dummiesResult;

    // Reorder nodes within layers to minimize crossings (X-ordering)
    auto orderedLayers = reduceCrossings(
        layersWithDummies,
        horizontalPositions,
        subconceptsRelation,
        superconceptsRelation,
        progress);

    // Final coordinate assignment
    createLayout(
        result,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        *orderedLayers,
        progress,
        getPlacementFunc(placement));

    long long endTime = nowMills();

    result.time = (int)endTime - startTime;
}