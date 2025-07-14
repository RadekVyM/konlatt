#include "../utils.h"
#include "../types/TimedResult.h"
#include "freeseLayout.h"

#include <stdio.h>
#include <iostream>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <algorithm>

void computeFreeseLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    long long startTime = nowMills();

    long long endTime = nowMills();

    result.time = (int)endTime - startTime;
}