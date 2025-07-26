#include "utils.h"
#include <memory>
#include <vector>
#include <unordered_set>
#include <queue>

float getX(std::vector<float>& layout, int index) {
    return layout[index * COORDS_COUNT];
}
float getY(std::vector<float>& layout, int index) {
    return layout[index * COORDS_COUNT + 1];
}
float getZ(std::vector<float>& layout, int index) {
    return layout[index * COORDS_COUNT + 2];
}

void setX(std::vector<float>& layout, int index, float value) {
    layout[index * COORDS_COUNT] = value;
}
void setY(std::vector<float>& layout, int index, float value) {
    layout[index * COORDS_COUNT + 1] = value;
}
void setZ(std::vector<float>& layout, int index, float value) {
    layout[index * COORDS_COUNT + 2] = value;
}

void topologicalSortImpl(
    int currentIndex,
    std::vector<std::unordered_set<int>>& coverRelation,
    std::vector<bool>& visited,
    std::vector<int>& topologicalOrder,
    std::shared_ptr<int> sortedLastIndex
) {
    // https://en.wikipedia.org/wiki/Longest_path_problem#Acyclic_graphs

    std::unordered_set<int>& subconcepts = coverRelation[currentIndex];
    visited[currentIndex] = true;

    for (int subconceptIndex : subconcepts) {
        if (!visited[subconceptIndex]) {
            topologicalSortImpl(
                subconceptIndex,
                coverRelation,
                visited,
                topologicalOrder,
                sortedLastIndex);
        }
    }

    topologicalOrder[*sortedLastIndex] = currentIndex;
    *sortedLastIndex = *sortedLastIndex - 1;
}

std::unique_ptr<std::vector<int>> topologicalSort(int startConceptIndex, std::vector<std::unordered_set<int>>& coverRelation) {
    std::unique_ptr<std::vector<int>> topologicalOrder = make_unique<std::vector<int>>();
    std::vector<bool> visited;
    std::shared_ptr<int> sortedLastIndex = make_shared<int>();

    visited.resize(coverRelation.size());
    topologicalOrder->resize(coverRelation.size());
    *sortedLastIndex = coverRelation.size() - 1;

    topologicalSortImpl(
        startConceptIndex,
        coverRelation,
        visited,
        *topologicalOrder,
        sortedLastIndex);

    return topologicalOrder;
}

void getComparableConceptsOneWay(
    std::unordered_set<int>& comparableConcepts,
    int conceptIndex,
    std::vector<std::unordered_set<int>>& mapping
) {
    std::queue<int> conceptsQueue;

    conceptsQueue.push(conceptIndex);

    while (!conceptsQueue.empty()) {
        int conceptIndex = conceptsQueue.front();
        conceptsQueue.pop();

        auto& subconcepts = mapping[conceptIndex];

        for (auto subconcept : subconcepts) {
            if (!comparableConcepts.count(subconcept)) {
                comparableConcepts.insert(subconcept);
                conceptsQueue.push(subconcept);
            }
        }
    }
}

std::unique_ptr<std::unordered_set<int>> getComparableConcepts(
    int conceptIndex,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    auto comparableConcepts = std::make_unique<std::unordered_set<int>>();

    getComparableConceptsOneWay(
        *comparableConcepts,
        conceptIndex,
        subconceptsMapping);

    getComparableConceptsOneWay(
        *comparableConcepts,
        conceptIndex,
        superconceptsMapping);

    return comparableConcepts;
}