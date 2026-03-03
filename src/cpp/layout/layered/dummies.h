#ifndef DUMMIES_H
#define DUMMIES_H

#include "../../types/ProgressData.h"

#include <vector>
#include <memory>
#include <unordered_set>

std::unique_ptr<std::tuple<
    std::vector<std::vector<int>>,
    std::vector<int>
>> addDummies(
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    std::vector<std::unordered_set<int>>& layers,
    const std::vector<int>& layersMapping,
    ProgressData& progress
);

#endif