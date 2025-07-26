#ifndef REDRAW_LAYOUT_H
#define REDRAW_LAYOUT_H

#include <vector>
#include <unordered_set>
#include <functional>
#include "../types/TimedResult.h"

void computeReDrawLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    std::function<void(double)> onProgress
);

#endif