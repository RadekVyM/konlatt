#include "../utils.h"
#include "../types/TimedResult.h"
#include "utils.h"
#include "layers.h"
#include "freeseLayout.h"

#define _USE_MATH_DEFINES

#include <stdio.h>
#include <cmath>
#include <iostream>
#include <vector>
#include <memory>
#include <unordered_set>
#include <unordered_map>
#include <queue>
#include <algorithm>

using namespace std;

#define PRIMES_COUNT 10
#define CORRECTION_FACTOR 0.5
#define ATTRACTION_CONSTANT 0.1
#define REPULSION_CONSTANT 1
#define ITERATIONS 30

const int PRIMES[PRIMES_COUNT] = { 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 };
int nextPrimeIndex = 0;

int nextPrime() {
    int prime = PRIMES[nextPrimeIndex];
    nextPrimeIndex = (nextPrimeIndex + 1) % PRIMES_COUNT;
    return prime;
}

std::unique_ptr<std::tuple<std::vector<int>, std::unordered_map<int, int>>> assignRanksToNodes(
    int conceptsCount,
    int supremum,
    int infimum,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    auto depthsResult = assignNodesToLayersByLongestPath(supremum, subconceptsMapping);
    auto& [depthsMapping, depthLayers] = *depthsResult;
    auto heightResult = assignNodesToLayersByLongestPath(infimum, superconceptsMapping);
    auto& [heightsMapping, heightLayers] = *heightResult;

    auto result = std::make_unique<std::tuple<std::vector<int>, std::unordered_map<int, int>>>();

    int maxDepth = depthLayers.size();
    auto& [ranksMapping, rankCounts] = *result;
    ranksMapping.resize(conceptsCount);

    for (int node = 0; node < conceptsCount; node++) {
        int rank = maxDepth + heightsMapping[node] - depthsMapping[node];

        ranksMapping[node] = rank;

        int currentCount = rankCounts.count(rank) ? rankCounts.at(rank) : 0;
        rankCounts[rank] = currentCount + 1;
    }

    return result;
}

float distanceByRank(int rank, int rankCount) {
    return rankCount == 1 ? 0 : std::sqrt(rankCount) * 2; // rankCount
}

void initializeLayout(
    std::vector<float>& layout,
    int conceptsCount,
    std::vector<int>& ranksMapping,
    std::unordered_map<int, int>& rankCounts
) {
    std::unordered_map<int, int> rankCountsLeft;

    auto maxIt = std::max_element(
        rankCounts.begin(),
        rankCounts.end(),
        [](const auto& p1, const auto& p2) {
            return p1.first < p2.first;
        });
    int maxRank = maxIt->first;
    float topOffset = (float)(maxRank + 1) / -2;

    layout.resize(conceptsCount * COORDS_COUNT, 0);

    for (int i = 0; i < conceptsCount; i++) {
        int rank = ranksMapping[i];
        int rankCount = rankCounts[rank];
        float distance = distanceByRank(rank, rankCount);
        float angle = 2 * M_PI / rankCount;

        int left = rankCountsLeft[rank] = rankCountsLeft.count(rank) ?
            rankCountsLeft[rank] - 1 :
            rankCount - 1;

        setX(layout, i, distance * std::cos(left * angle + M_PI / nextPrime()));
        setY(layout, i, rank + topOffset);
        setZ(layout, i, distance * std::sin(left * angle + M_PI / nextPrime()));
    }
}

void normalizeDistances(
    std::vector<float>& layout,
    int conceptsCount,
    std::vector<int>& ranksMapping,
    std::unordered_map<int, int>& rankCounts
) {
    for (int i = 0; i < conceptsCount; i++) {
        int rank = ranksMapping[i];
        int rankCount = rankCounts[rank];
        float idealDistance = distanceByRank(rank, rankCount);

        float x = getX(layout, i);
        float z = getZ(layout, i);

        float currentDistance = std::sqrt(x * x + z * z);

        if (idealDistance == 0) {
            setX(layout, i, 0);
            setZ(layout, i, 0);
            continue;
        }

        if (currentDistance <= idealDistance * 1.5) {
            continue;
        }

        float scale = idealDistance / currentDistance;

        setX(layout, i, x * scale);
        setZ(layout, i, z * scale);
    }
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

float forceCorrelation(ForcePoint& force) {
    float newLength = std::sqrt(force.newX * force.newX + force.newZ * force.newZ);
    float oldLength = std::sqrt(force.oldX * force.oldX + force.oldZ * force.oldZ);

    return newLength == 0 || oldLength == 0 ?
        0 :
        (force.newX * force.oldX + force.newZ * force.oldZ) / (newLength * oldLength);
}

void adjustForce(
    std::vector<ForcePoint>& forces,
    int index,
    float dx,
    float dz
) {
    if (std::abs(dx) >= 1 || std::abs(dz) >= 1) {
        // Do not apply huge forces, otherwise, it can lead to NaN values pretty fast
        float scale = std::max(std::abs(dx), std::abs(dz));

        dx /= scale;
        dz /= scale;
    }

    forces[index].newX += dx;
    forces[index].newZ += dz;
}

void applyForce(
    std::vector<float>& layout,
    std::vector<ForcePoint>& forces,
    int index
) {
    ForcePoint& force = forces[index];
    float correction = 1 + CORRECTION_FACTOR * forceCorrelation(force);

    setX(layout, index, getX(layout, index) + correction * force.newX);
    setZ(layout, index, getZ(layout, index) + correction * force.newZ);

    force.oldX = force.newX;
    force.oldZ = force.newZ;
    force.newX = 0;
    force.newZ = 0;
}

void attraction(
    std::vector<ForcePoint>& forces,
    float attractionFactor,
    std::vector<float>& layout,
    int first,
    int second
) {
    float dx = attractionFactor * (getX(layout, second) - getX(layout, first));
    float dz = attractionFactor * (getZ(layout, second) - getZ(layout, first));

    adjustForce(forces, first, dx, dz);
    adjustForce(forces, second, -dx, -dz);
}

void repulsion(
    std::vector<ForcePoint>& forces,
    float repulsionFactor,
    std::vector<float>& layout,
    int first,
    int second
) {
    float dx = getX(layout, first) - getX(layout, second);
    float dy = getY(layout, first) - getY(layout, second);
    float dz = getZ(layout, first) - getZ(layout, second);

    float denominator = dy == 0 && -0.2 < dx && dx < 0.2 && -0.2 < dz && dz < 0.2 ?
        37 :
        (1 / (std::pow(std::abs(dx), 3) + std::pow(std::abs(dy), 3) + std::pow(std::abs(dz), 3)));

    dx *= denominator * repulsionFactor;
    dz *= denominator * repulsionFactor;

    adjustForce(forces, first, dx, dz);
    adjustForce(forces, second, -dx, -dz);
}

void update(
    std::vector<float>& layout,
    std::vector<ForcePoint>& forces,
    float attractionFactor,
    float repulsionFactor,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        auto comparableConcepts = getComparableConcepts(conceptIndex, subconceptsMapping, superconceptsMapping);

        for (int comp : *comparableConcepts) {
            attraction(forces, attractionFactor, layout, conceptIndex, comp);
        }

        for (int incomp = 0; incomp < conceptsCount; incomp++) {
            if (incomp == conceptIndex || comparableConcepts->count(incomp)) {
                continue;
            }

            repulsion(forces, repulsionFactor, layout, conceptIndex, incomp);
        }
    }

    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        applyForce(layout, forces, conceptIndex);
    }
}

void multiUpdate(
    int updatesCount,
    std::vector<float>& layout,
    std::vector<ForcePoint>& forces,
    float attractionFactor,
    float repulsionFactor,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    for (int i = 0; i < updatesCount; i++) {
        std::cout << i << "\n";
        update(layout, forces, attractionFactor, repulsionFactor, conceptsCount, subconceptsMapping, superconceptsMapping);
    }
}

void computeFreeseLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    long long startTime = nowMills();

    auto ranksResult = assignRanksToNodes(conceptsCount, supremum, infimum, subconceptsMapping, superconceptsMapping);
    auto& [ranksMapping, rankCounts] = *ranksResult;
    auto forces = std::make_unique<std::vector<ForcePoint>>();

    forces->resize(conceptsCount);

    float attractionFactor = ATTRACTION_CONSTANT / std::sqrt(conceptsCount);
    float repulsionFactor = REPULSION_CONSTANT / std::sqrt(conceptsCount);

    initializeLayout(result.value, conceptsCount, ranksMapping, rankCounts);

    multiUpdate(
        ITERATIONS + conceptsCount,
        result.value,
        *forces,
        attractionFactor * 0.5,
        repulsionFactor * 3,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping);

    multiUpdate(
        ITERATIONS + conceptsCount,
        result.value,
        *forces,
        attractionFactor * 3,
        repulsionFactor * 0.5,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping);

    multiUpdate(
        ITERATIONS + conceptsCount,
        result.value,
        *forces,
        attractionFactor * 0.75,
        repulsionFactor * 1.5,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping);

    normalizeDistances(result.value, conceptsCount, ranksMapping, rankCounts);

    long long endTime = nowMills();

    result.time = (int)endTime - startTime;
}