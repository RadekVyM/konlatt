#ifndef LAYERED_LAYOUT_H
#define LAYERED_LAYOUT_H

#include <vector>
#include <unordered_set>
#include "../../types/TimedResult.h"

void computeLayeredLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
);

#endif