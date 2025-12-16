// Implementation of Wilhelm Barth, Michael Jünger and Petra Mutzel, "Simple and Efficient Bilayer Cross Counting"
// https://kups.ub.uni-koeln.de/54863/1/zaik2002-433.pdf

// Strongly inspired by https://github.com/dagrejs/dagre/blob/master/lib/order/cross-count.js


#include "crossCount.h"

#include <vector>
#include <unordered_set>
#include <algorithm>
#include <iterator>
#include <numeric>

long long twoLayerCrossCount(
    std::vector<int>& northLayer,
    std::vector<int>& southLayer,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    CrossCountDataStructures& datastructures
) {
    // Create the permutation

    for (int northNode : northLayer) {
        int startIndex = datastructures.permutation.size();
        auto& subnodes = subconceptsMapping[northNode];

        std::vector<int> southNodePositions;
        southNodePositions.reserve(subnodes.size());

        int offset = horizontalPositions[southLayer[0]];

        std::transform(
            subnodes.begin(), subnodes.end(), 
            std::back_inserter(southNodePositions),
            [&horizontalPositions, &offset](int southNode) {
                return horizontalPositions[southNode] - offset;
            }
        );

        std::sort(southNodePositions.begin(), southNodePositions.end());

        datastructures.permutation.insert(datastructures.permutation.end(), southNodePositions.begin(), southNodePositions.end());
    }

    // Build the accumulator tree

    int firstIndex = 1;
    while (firstIndex < southLayer.size()) {
        firstIndex <<= 1;
    }

    int treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;

    datastructures.tree.resize(treeSize, 0);

    // Calculate the inversions (crossings)

    long long count = 0;

    for (int position : datastructures.permutation) {
        int index = position + firstIndex;
        datastructures.tree[index]++;

        while (index > 0) {
            if (index % 2) {
                count += datastructures.tree[index + 1];
            }

            index = (index - 1) >> 1;

            datastructures.tree[index]++;
        }
    }

    datastructures.permutation.clear();
    datastructures.tree.clear();

    return count;
}

long long crossCount(
    std::vector<std::vector<int>>& layers,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    CrossCountDataStructures& datastructures
) {
    // Preallocate the data structures
    std::size_t edgesCount = std::accumulate(
        subconceptsMapping.begin(),
        subconceptsMapping.end(),
        0,
        [](std::size_t currentSum, const std::unordered_set<int>& subconcepts) {
            return currentSum + subconcepts.size();
        }
    );
    datastructures.permutation.reserve(edgesCount);
    datastructures.tree.reserve(subconceptsMapping.size());

    long long count = 0;

    // First and last layers can be ignored, there will not be any crossings
    for (int i = 1; i < layers.size() - 2; i++) {
        count += twoLayerCrossCount(
            layers[i],
            layers[i + 1],
            horizontalPositions,
            subconceptsMapping,
            datastructures);
    }

    return count;
}