#ifndef LAYOUT_UTILS_H
#define LAYOUT_UTILS_H

#include <vector>
#include <unordered_set>
#include <memory>

#define COORDS_COUNT 3

float getX(std::vector<float>& layout, int index);
float getY(std::vector<float>& layout, int index);
float getZ(std::vector<float>& layout, int index);
void setX(std::vector<float>& layout, int index, float value);
void setY(std::vector<float>& layout, int index, float value);
void setZ(std::vector<float>& layout, int index, float value);

std::unique_ptr<std::vector<int>> topologicalSort(int startConceptIndex, std::vector<std::unordered_set<int>>& coverRelation);

std::unique_ptr<std::unordered_set<int>> getComparableConcepts(
    int conceptIndex,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
);

#endif