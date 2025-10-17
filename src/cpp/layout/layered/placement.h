#ifndef PLACEMENT_H
#define PLACEMENT_H

#define DECLARE_PLACEMENT_FUNCTION(FUNCTION_NAME) \
    void FUNCTION_NAME(std::vector<float>& result, std::vector<std::vector<int>>& layers, int conceptsCount);

DECLARE_PLACEMENT_FUNCTION(simplePlacement)

#endif