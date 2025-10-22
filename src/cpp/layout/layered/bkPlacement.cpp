// Implementation of Brandes and Köpf, "Fast and Simple Horizontal Coordinate Assignment."
// https://link.springer.com/content/pdf/10.1007/3-540-45848-4_3

// Strongly inspired by https://github.com/dagrejs/dagre/blob/master/lib/position/bk.js

#include "../utils.h"
#include "placement.h"

#include <vector>
#include <array>
#include <unordered_map>
#include <unordered_set>
#include <optional>
#include <algorithm>
#include <functional>
#include <algorithm>

#define UNDEFINED_FLOAT std::numeric_limits<float>::min()
#define FLOAT_MAX std::numeric_limits<float>::max()
#define FLOAT_MIN std::numeric_limits<float>::min()

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

bool isAlignmentUp(int alignment) {
    return alignment > 1;
}

bool isAlignmentLeft(int alignment) {
    return alignment % 2 == 1;
}

std::vector<int> findMediansDestructive(
    std::vector<int>& nodes,
    std::vector<int>& horizontalOrder,
    bool left
) {
    if (nodes.empty() || horizontalOrder.empty()) {
        throw std::out_of_range("Cannot find median of an empty vector");
    }

    int lowerMedianIndex = (nodes.size() - 1) / 2;
    int upperMedianIndex = nodes.size() / 2;

    auto comparer = [&](int a, int b) { 
        return left ?
            horizontalOrder[b] < horizontalOrder[a] :
            horizontalOrder[a] < horizontalOrder[b];
    };

    std::nth_element(
        nodes.begin(), 
        nodes.begin() + lowerMedianIndex, 
        nodes.end(),
        comparer);
    int lowerMedian = nodes[lowerMedianIndex];

    if (nodes.size() % 2 == 1) {
        return { lowerMedian };
    }

    std::nth_element(
        nodes.begin(), 
        nodes.begin() + upperMedianIndex, 
        nodes.end(),
        comparer);
    int upperMedian = nodes[upperMedianIndex];

    return { lowerMedian, upperMedian };
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

            for (int median : findMediansDestructive(neighbors, horizontalOrder, left)) {
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

std::pair<int, float> getMinWidthCoords(
    std::array<std::vector<float>, 4>& horizontalCoords
) {
    int alignmentIndex = -1;
    float minWidth = FLOAT_MAX;

    for (int i = 0; i < horizontalCoords.size(); i++) {
        std::vector<float>& coords = horizontalCoords[i];
        float min = FLOAT_MAX;
        float max = FLOAT_MIN;

        for (int node = 0; node < coords.size(); node++) {
            min = std::min(min, coords[node]);
            max = std::max(max, coords[node]);
        }

        float width = max - min;

        if (width < minWidth) {
            alignmentIndex = i;
            minWidth = width;
        }
    }

    return { alignmentIndex, minWidth };
}

void alignHorizontalCoords(
    std::array<std::vector<float>, 4>& horizontalCoords,
    int minWidthIndex
) {
    auto& minWidthCoords = horizontalCoords[minWidthIndex];

    if (minWidthCoords.size() == 0) {
        return;
    }

    float minAlignmentCoord = *std::min_element(minWidthCoords.begin(), minWidthCoords.end());
    float maxAlignmentCoord = *std::max_element(minWidthCoords.begin(), minWidthCoords.end());

    for (int i = 0; i < horizontalCoords.size(); i++) {
        if (minWidthIndex == i) {
            continue;
        }

        auto& coords = horizontalCoords[i];
        float delta = isAlignmentLeft(i) ?
            maxAlignmentCoord - *std::max_element(coords.begin(), coords.end()) :
            minAlignmentCoord - *std::min_element(coords.begin(), coords.end());

        if (delta) {
            for (int node = 0; node < coords.size(); node++) {
                coords[node] += delta;
            }
        }
    }
}

void balance(std::array<std::vector<float>, 4>& horizontalCoords) {
    for (int node = 0; node < horizontalCoords[0].size(); node++) {
        std::array<float, 4> coords = {
            horizontalCoords[0][node],
            horizontalCoords[1][node],
            horizontalCoords[2][node],
            horizontalCoords[3][node]
        };

        std::nth_element(
            coords.begin(), 
            coords.begin() + 1, 
            coords.end());
        float lowerMedian = coords[1];

        std::nth_element(
            coords.begin(), 
            coords.begin() + 2, 
            coords.end());
        float upperMedian = coords[2];

        horizontalCoords[0][node] = (lowerMedian + upperMedian) / 2;
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

    std::array<std::vector<float>, 4> horizontalCoords;

    for (int i = 0; i < 4; i++) {
        bool up = isAlignmentUp(i);
        bool left = isAlignmentLeft(i);

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
            roots,
            up,
            left);

        horizontalCompaction(
            alignedNodes,
            roots,
            horizontalOrder,
            predecessors,
            horizontalCoords[i],
            delta);
    }

    auto [minWidthIndex, minWidth] = getMinWidthCoords(horizontalCoords);
    alignHorizontalCoords(horizontalCoords, minWidthIndex);
    balance(horizontalCoords);

    auto& finalHorizontalCoords = horizontalCoords[0];
    float top = (float)(layers.size() - 1) / -2;
    float minCoord = *std::min_element(finalHorizontalCoords.begin(), finalHorizontalCoords.end());
    float maxCoord = *std::max_element(finalHorizontalCoords.begin(), finalHorizontalCoords.end());
    float horizontalOffset = -minCoord - ((maxCoord - minCoord) / 2);

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];

        for (int node : layer) {
            if (node < conceptsCount) {
                setX(result, node, finalHorizontalCoords[node] + horizontalOffset);
                setY(result, node, -top);
                setZ(result, node, 0);
            }
        }

        top += 1;
    }
}