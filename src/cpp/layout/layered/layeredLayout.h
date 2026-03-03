#ifndef LAYERED_LAYOUT_H
#define LAYERED_LAYOUT_H

#include <vector>
#include <unordered_set>
#include "../../types/TimedResult.h"

void computeLayeredLayout(
    TimedResult<std::vector<float>> &result,
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>> &subconceptsRelation,
    std::vector<std::unordered_set<int>> &superconceptsRelation,
    std::string placement,
    std::function<void(double)> onProgress);

#endif