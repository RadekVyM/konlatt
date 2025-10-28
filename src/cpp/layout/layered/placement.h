#ifndef PLACEMENT_H
#define PLACEMENT_H

#include "../../types/ProgressData.h"

#include <limits>

#define UNDEFINED_FLOAT std::numeric_limits<float>::min()
#define FLOAT_MAX std::numeric_limits<float>::max()
#define FLOAT_MIN std::numeric_limits<float>::min()

#define DECLARE_PLACEMENT_FUNCTION(FUNCTION_NAME) \
    void FUNCTION_NAME( \
        std::vector<float>& result, \
        std::vector<std::vector<int>>& layers, \
        std::vector<std::unordered_set<int>>& subconceptsMapping, \
        std::vector<std::unordered_set<int>>& superconceptsMapping, \
        int conceptsCount, \
        ProgressData& progress);

DECLARE_PLACEMENT_FUNCTION(simplePlacement)
DECLARE_PLACEMENT_FUNCTION(bkPlacement)
DECLARE_PLACEMENT_FUNCTION(ellipsePlacement)

#endif