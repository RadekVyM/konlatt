#ifndef PLACEMENT_H
#define PLACEMENT_H

#include "../../types/ProgressData.h"

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

#endif