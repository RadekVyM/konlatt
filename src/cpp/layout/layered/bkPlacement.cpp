// Implementation of Brandes and Köpf, "Fast and Simple Horizontal Coordinate Assignment."
// https://link.springer.com/content/pdf/10.1007/3-540-45848-4_3

// Strongly inspired by https://github.com/dagrejs/dagre/blob/master/lib/position/bk.js

#include "../utils.h"
#include "placement.h"

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <optional>
#include <algorithm>
#include <functional>

#define UNDEFINED_FLOAT std::numeric_limits<float>::min()
#define FLOAT_MAX std::numeric_limits<float>::max()

using Conflicts = std::unordered_map<int, std::unordered_set<int>>;
using NodesList = std::vector<int>;

void setupHorizontalOrder(
    std::vector<int>& horizontalOrder,
    std::vector<int>& predecessors,
    const std::vector<std::vector<int>>& layers
) {
    for (int i = 0; i < layers.size(); i++) {
        for (int j = 0; j < layers[i].size(); j++) {
            horizontalOrder[layers[i][j]] = j;
            predecessors[layers[i][j]] = j == 0 ?
                -1 :
                layers[i][j - 1];
        }
    }
}

bool isDummy(int node, int conceptsCount) {
    return node >= conceptsCount;
}

std::optional<int> findOtherInnerSegmentNode(
    int node,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    int conceptsCount
) {
    if (isDummy(node, conceptsCount)) {
        for (auto super : superconceptsMapping[node]) {
            if (isDummy(super, conceptsCount)) {
                return super;
            }
        }
    }

    return std::nullopt;
}

void addConflict(
    Conflicts& conflicts,
    int from,
    int to
) {
    if (from > to) {
        std::swap(from, to);
    }

    if (conflicts.find(from) != conflicts.end()) {
        conflicts[from].insert(to);
    }
    else {
        conflicts.emplace(from, std::unordered_set<int>{to});
    }
}

bool hasConflict(
    Conflicts& conflicts,
    int from,
    int to
) {
    if (from > to) {
        std::swap(from, to);
    }

    return conflicts.find(from) != conflicts.end() &&
        conflicts[from].find(to) != conflicts[from].end();
}

void markConflicts(
    std::vector<std::vector<int>>& layers,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    int conceptsCount,
    std::vector<int>& horizontalOrder,
    Conflicts& conflicts
) {
    if (layers.size() <= 2) {
        return;
    }

    for (int layerIndex = 1; layerIndex < layers.size(); layerIndex++) {
        auto& layer = layers[layerIndex];
        int lastOtherInnerSegmentNodeOrder = 0;
        int startScanIndex = 0;

        for (int nodeIndex = 0; nodeIndex < layer.size(); nodeIndex++) {
            int node = layer[nodeIndex];
            auto otherInnerSegmentNode = findOtherInnerSegmentNode(node, superconceptsMapping, conceptsCount);
            int otherInnerSegmentNodeOrder = otherInnerSegmentNode ?
                horizontalOrder[otherInnerSegmentNode.value()] :
                layers[layerIndex - 1].size();

            if (!otherInnerSegmentNode && nodeIndex != layer.size() - 1) {
                continue;
            }

            for (int scanNodeIndex = startScanIndex; scanNodeIndex < nodeIndex + 1; scanNodeIndex++) {
                int scanNode = layer[scanNodeIndex];

                for (auto superNode : superconceptsMapping[scanNode]) {
                    int superOrder = horizontalOrder[superNode];

                    // type 1
                    if ((superOrder < lastOtherInnerSegmentNodeOrder || otherInnerSegmentNodeOrder < superOrder) &&
                        !(isDummy(superOrder, conceptsCount) && isDummy(scanNode, conceptsCount))) {
                        addConflict(conflicts, superNode, scanNode);
                    }
                }
            }

            // type 2
            if (otherInnerSegmentNodeOrder < lastOtherInnerSegmentNodeOrder) {
                addConflict(conflicts, otherInnerSegmentNode.value(), node);
            }

            startScanIndex = nodeIndex + 1;
            lastOtherInnerSegmentNodeOrder = otherInnerSegmentNodeOrder;
        }
    }
}

void verticalAlignment(
    std::vector<std::vector<int>>& layers,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    int conceptsCount,
    std::vector<int>& horizontalOrder,
    Conflicts& conflicts,
    NodesList& alignedNodes,
    NodesList& roots,
    bool up = false,
    bool left = false
) {
    int nodesCount = horizontalOrder.size();
    alignedNodes.resize(nodesCount);
    roots.resize(nodesCount);

    for (int i = 0; i < nodesCount; i++) {
        alignedNodes[i] = i;
        roots[i] = i;
    }

    if (layers.size() <= 2) {
        return;
    }

    int startLayerIndex = up ? layers.size() - 2 : 1;
    int layerIncrease = up ? -1 : 1;
    auto& neighborsMapping = up ? subconceptsMapping : superconceptsMapping;

    for (int layerIndex = startLayerIndex; layerIndex < layers.size() && layerIndex >= 0; layerIndex += layerIncrease) {
        auto& layer = layers[layerIndex];
        int startNodeIndex = left ? layer.size() - 1 : 0;
        int nodeIncrease = left ? -1 : 1;

        int previousMedianOrder = -1;

        for (int nodeIndex = startNodeIndex; nodeIndex < layer.size() && nodeIndex >= 0; nodeIndex += nodeIncrease) {
            int node = layer[nodeIndex];

            auto& neighborsSet = neighborsMapping[node];
            auto neighbors = std::vector<int>(neighborsSet.begin(), neighborsSet.end());
            // Future self, be aware of the strict weak ordering! You are welcome!
            std::sort(neighbors.begin(), neighbors.end(), [&](int a, int b) {
                return left ?
                    horizontalOrder[b] < horizontalOrder[a] :
                    horizontalOrder[a] < horizontalOrder[b];
            });

            double medianPosition = (neighbors.size() - 1) / 2;
            int lowerMedianPosition = (int)std::floor(medianPosition);
            int upperMedianPosition = (int)std::ceil(medianPosition);

            for (int i = lowerMedianPosition; i <= upperMedianPosition; i++) {
                int median = neighbors[i];

                if (alignedNodes[node] == node &&
                    previousMedianOrder < horizontalOrder[median] &&
                    !hasConflict(conflicts, node, median)) {
                    alignedNodes[median] = node;
                    alignedNodes[node] = roots[node] = roots[median];
                    previousMedianOrder = horizontalOrder[median];
                }
            }
        }
    }
}

void placeBlock(
    int node,
    NodesList& alignedNodes,
    NodesList& roots,
    NodesList& sink,
    std::vector<int>& horizontalOrder,
    NodesList& predecessors,
    std::vector<float>& shift,
    std::vector<float>& horizontalCoords,
    float delta
) {
    if (horizontalCoords[node] != UNDEFINED_FLOAT) {
        return;
    }

    horizontalCoords[node] = 0;
    int alignedNode = node;

    do {
        if (horizontalOrder[alignedNode] > 0) {
            int pred = predecessors[alignedNode];
            int predBlockRoot = roots[pred];

            placeBlock(
                predBlockRoot,
                alignedNodes,
                roots,
                sink,
                horizontalOrder,
                predecessors,
                shift,
                horizontalCoords,
                delta);

            if (sink[node] == node) {
                sink[node] = sink[predBlockRoot];
            }
            if (sink[node] != sink[predBlockRoot]) {
                shift[sink[predBlockRoot]] = std::min(
                    shift[sink[predBlockRoot]],
                    horizontalCoords[node] - horizontalCoords[predBlockRoot] - delta);
            }
            else {
                horizontalCoords[node] = std::max(horizontalCoords[node], horizontalCoords[predBlockRoot] + delta);
            }
        }

        alignedNode = alignedNodes[alignedNode];
    } while (node != alignedNode);
}

void horizontalCompaction(
    NodesList& alignedNodes,
    NodesList& roots,
    std::vector<int>& horizontalOrder,
    NodesList& predecessors,
    std::vector<float>& horizontalCoords,
    float delta
) {
    int nodesCount = horizontalOrder.size();
    NodesList sink;
    std::vector<float> shift;

    horizontalCoords.resize(nodesCount, UNDEFINED_FLOAT);
    shift.resize(nodesCount, FLOAT_MAX);
    sink.resize(nodesCount);

    for (int node = 0; node < nodesCount; node++) {
        sink[node] = node;
    }

    for (int node = 0; node < nodesCount; node++) {
        if (roots[node] == node) {
            placeBlock(
                node,
                alignedNodes,
                roots,
                sink,
                horizontalOrder,
                predecessors,
                shift,
                horizontalCoords,
                delta);
        }
    }

    for (int node = 0; node < nodesCount; node++) {
        horizontalCoords[node] = horizontalCoords[roots[node]];
        float nodeShift = shift[sink[roots[node]]];

        if (nodeShift < FLOAT_MAX) {
            horizontalCoords[node] = horizontalCoords[node] + nodeShift;
        }
    }
}

/**
 * Places the nodes using Brandes and Köpf, "Fast and Simple Horizontal Coordinate Assignment."
 * 
 * Layers need to be sorted from top to bottom.
 */
void bkPlacement(
    std::vector<float>& result,
    std::vector<std::vector<int>>& layers,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    int conceptsCount
) {
    float delta = 1;
    auto horizontalOrder = std::vector<int>(subconceptsMapping.size());
    auto predecessors = std::vector<int>(subconceptsMapping.size());
    setupHorizontalOrder(horizontalOrder, predecessors, layers);

    Conflicts conflicts;
    markConflicts(
        layers,
        superconceptsMapping,
        conceptsCount,
        horizontalOrder,
        conflicts);

    // Linked list of references to lower nodes in node's block
    NodesList alignedNodes;
    // Linked list of references to roots of the node blocks
    NodesList roots;
    verticalAlignment(
        layers,
        subconceptsMapping,
        superconceptsMapping,
        conceptsCount,
        horizontalOrder,
        conflicts,
        alignedNodes,
        roots);

    std::vector<float> horizontalCoords;
    horizontalCompaction(
        alignedNodes,
        roots,
        horizontalOrder,
        predecessors,
        horizontalCoords,
        delta);

    float top = (float)(layers.size() - 1) / -2;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];

        for (int node : layer) {
            if (node < conceptsCount) {
                setX(result, node, horizontalCoords[node]);
                setY(result, node, -top);
                setZ(result, node, 0);
            }
        }

        top += 1;
    }
}