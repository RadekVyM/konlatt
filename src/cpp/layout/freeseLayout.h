#ifndef FREESE_LAYOUT_H
#define FREESE_LAYOUT_H

#include <vector>
#include <unordered_set>
#include <functional>
#include "../types/TimedResult.h"

struct ForcePoint {
    float oldX;
    float oldZ;
    float newX;
    float newZ;
};

void computeFreeseLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    std::function<void(double)> onProgress
);

#endif