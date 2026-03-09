#include "utils.h"
#include <memory>
#include <vector>
#include <unordered_set>
#include <queue>
#include <functional>

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

/**
 * Recursive DFS for topological sort.
 * Fills the topologicalOrder array from back to front.
 */
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

/**
 * Recursive DFS for topological sort.
 */
std::unique_ptr<std::vector<int>> topologicalSort(int startConceptIndex, std::vector<std::unordered_set<int>>& coverRelation) {
    std::unique_ptr<std::vector<int>> topologicalOrder = std::make_unique<std::vector<int>>();
    std::vector<bool> visited;
    // Shared pointer used here to track the insertion index across recursive calls
    std::shared_ptr<int> sortedLastIndex = std::make_shared<int>();

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

/**
 * BFS traversal to find all reachable nodes in a specific direction (up or down).
 */
void getComparableConceptsOneWay(
    std::unordered_set<int>& comparableConcepts,
    int conceptIndex,
    std::vector<std::unordered_set<int>>& relation
) {
    std::queue<int> conceptsQueue;

    conceptsQueue.push(conceptIndex);

    while (!conceptsQueue.empty()) {
        int conceptIndex = conceptsQueue.front();
        conceptsQueue.pop();

        auto& subconcepts = relation[conceptIndex];

        for (auto subconcept : subconcepts) {
            if (!comparableConcepts.count(subconcept)) {
                comparableConcepts.insert(subconcept);
                conceptsQueue.push(subconcept);
            }
        }
    }
}

/**
 * Finds all nodes related to a concept by traversing both subconcepts and superconcepts.
 */
std::unique_ptr<std::unordered_set<int>> getComparableConcepts(
    int conceptIndex,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation
) {
    auto comparableConcepts = std::make_unique<std::unordered_set<int>>();

    // Traverse "down" the graph
    getComparableConceptsOneWay(
        *comparableConcepts,
        conceptIndex,
        subconceptsRelation);

    // Traverse "up" the graph
    getComparableConceptsOneWay(
        *comparableConcepts,
        conceptIndex,
        superconceptsRelation);

    return comparableConcepts;
}