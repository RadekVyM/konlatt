#ifndef LAYERED_LAYOUT_H
#define LAYERED_LAYOUT_H

#include <vector>
#include <unordered_set>
#include "TimedResult.h"

TimedResult<std::vector<float>> computeLayeredLayout(
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
);

#endif