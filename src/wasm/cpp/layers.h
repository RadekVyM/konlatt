#ifndef LAYERS_H
#define LAYERS_H

#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>

std::unique_ptr<std::tuple<std::vector<int>, std::vector<std::unordered_set<int>>>> assignNodesToLayersByLongestPath(
    int startConceptIndex,
    std::vector<std::unordered_set<int>>& coverRelation);

#endif