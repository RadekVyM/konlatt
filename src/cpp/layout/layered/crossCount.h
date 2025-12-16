#ifndef CROSS_COUNT_H
#define CROSS_COUNT_H

#include <vector>
#include <unordered_set>

struct CrossCountDataStructures {
    std::vector<int> permutation;
    std::vector<int> tree;
};

/// @brief Counts edge crossings in the layers. The layers need to be sorted by horizontal positions.
/// @param layers
/// @param horizontalPositions
/// @param subconceptsMapping
/// @return
long long crossCount(
    std::vector<std::vector<int>>& layers,
    std::vector<int>& horizontalPositions,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    CrossCountDataStructures& datastructures
);

#endif