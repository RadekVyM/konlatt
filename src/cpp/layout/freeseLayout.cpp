// Implementation of the Freese algorithm:
// - https://www.researchgate.net/publication/220923353_Automated_Lattice_Drawing

// Based on the source code from: http://latdraw.org/

#include "../utils.h"
#include "../types/TimedResult.h"
#include "../types/ProgressData.h"
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
#include <functional>

#define PRIMES_COUNT 10
#define CORRECTION_FACTOR 0.5
#define ATTRACTION_CONSTANT 0.1
#define REPULSION_CONSTANT 1
#define ITERATIONS 30

// Primes used to jitter initial positions to prevent nodes from stacking perfectly
const int PRIMES[PRIMES_COUNT] = { 3, 5, 7, 11, 13, 17, 19, 23, 29, 31 };
int nextPrimeIndex = 0;

int nextPrime() {
    int prime = PRIMES[nextPrimeIndex];
    nextPrimeIndex = (nextPrimeIndex + 1) % PRIMES_COUNT;
    return prime;
}

/**
 * Calculates the vertical 'rank' of each node.
 * Rank is derived from the node's distance from both the top (supremum) and bottom (infimum).
 */
std::unique_ptr<std::tuple<std::vector<int>, std::unordered_map<int, int>>> assignRanksToNodes(
    int conceptsCount,
    int supremum,
    int infimum,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation
) {
    // Determine depth (dist from top) and height (dist from bottom) using longest path
    auto depthsResult = assignNodesToLayersByLongestPath(supremum, subconceptsRelation);
    auto& [depthsMapping, depthLayers] = *depthsResult;
    auto heightResult = assignNodesToLayersByLongestPath(infimum, superconceptsRelation);
    auto& [heightsMapping, heightLayers] = *heightResult;

    auto result = std::make_unique<std::tuple<std::vector<int>, std::unordered_map<int, int>>>();

    int maxDepth = depthLayers.size();
    auto& [ranksMapping, rankCounts] = *result;
    ranksMapping.resize(conceptsCount);

    for (int node = 0; node < conceptsCount; node++) {
        int rank = maxDepth + heightsMapping[node] - depthsMapping[node];

        ranksMapping[node] = rank;

        // Keep track of how many nodes occupy the same horizontal layer
        int currentCount = rankCounts.count(rank) ? rankCounts.at(rank) : 0;
        rankCounts[rank] = currentCount + 1;
    }

    return result;
}

/** Determines the radius of a rank's circle based on the number of nodes it contains */
float distanceByRank(int rank, int rankCount) {
    return rankCount == 1 ? 0 : std::sqrt(rankCount) * 2; // rankCount
}

/**
 * Places nodes initially in a circular pattern for each rank.
 * Uses Y-axis for rank (height) and X/Z for the horizontal plane.
 */
void initializeLayout(
    std::vector<float>& layout,
    int conceptsCount,
    std::vector<int>& ranksMapping,
    std::unordered_map<int, int>& rankCounts
) {
    std::unordered_map<int, int> rankCountsLeft;

    // Center the lattice vertically around Y=0
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

        int left = rankCountsLeft.count(rank) ?
            rankCountsLeft[rank] - 1 :
            rankCount - 1;
        rankCountsLeft[rank] = left;

        // Spread nodes in a circle on the XZ plane with a prime-based jitter
        setX(layout, i, distance * std::cos(left * angle + M_PI / nextPrime()));
        setY(layout, i, rank + topOffset);
        setZ(layout, i, distance * std::sin(left * angle + M_PI / nextPrime()));
    }
}

/**
 * Moves nodes so their distances from the center are closer to the ideal distances.
 * 
 * Constraints: Prevents nodes from drifting too far from the center of their rank.
 * Keeps the 'supremum' and 'infimum' strictly centered at (0, y, 0).
 */
void normalizeDistances(
    std::vector<float>& layout,
    int conceptsCount,
    int supremum,
    int infimum,
    std::vector<int>& ranksMapping,
    std::unordered_map<int, int>& rankCounts
) {
    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        int rank = ranksMapping[conceptIndex];
        int rankCount = rankCounts[rank];
        float idealDistance = distanceByRank(rank, rankCount);

        float x = getX(layout, conceptIndex);
        float z = getZ(layout, conceptIndex);

        float currentDistance = std::sqrt(x * x + z * z);

        if (conceptIndex == supremum || conceptIndex == infimum) {
            setX(layout, conceptIndex, 0);
            setZ(layout, conceptIndex, 0);
            continue;
        }

        // Pull node back toward center if it has drifted too far (threshold 1.5x)
        if (currentDistance == 0 || currentDistance <= idealDistance * 1.5) {
            continue;
        }

        float scale = idealDistance / currentDistance;

        setX(layout, conceptIndex, x * scale);
        setZ(layout, conceptIndex, z * scale);
    }
}

/** Calculates how much the new force aligns with the previous movement */
float forceCorrelation(ForcePoint& force) {
    float newLength = std::sqrt(force.newX * force.newX + force.newZ * force.newZ);
    float oldLength = std::sqrt(force.oldX * force.oldX + force.oldZ * force.oldZ);

    return newLength == 0 || oldLength == 0 ?
        0 :
        (force.newX * force.oldX + force.newZ * force.oldZ) / (newLength * oldLength);
}

/**
 * Updates node coordinates based on accumulated forces.
 */
void applyForce(
    std::vector<float>& layout,
    std::vector<ForcePoint>& forces,
    int index
) {
    ForcePoint& force = forces[index];
    // Accelerate if moving in the same direction, decelerate if jittering
    float correction = 1 + CORRECTION_FACTOR * forceCorrelation(force);

    setX(layout, index, getX(layout, index) + correction * force.newX);
    setZ(layout, index, getZ(layout, index) + correction * force.newZ);

    force.oldX = force.newX;
    force.oldZ = force.newZ;
    force.newX = 0;
    force.newZ = 0;
}

/**
 * Adds a vector to the node's current force, with a safety cap to prevent divergence (NaN).
 */
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

/**
 * Pulls related nodes together
*/
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

/**
 * pushes unrelated nodes away
*/
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

    // Avoid division by zero/large numbers when nodes are nearly overlapping
    float denominator = dy == 0 && -0.2 < dx && dx < 0.2 && -0.2 < dz && dz < 0.2 ?
        37 :
        (1 / (std::pow(std::abs(dx), 3) + std::pow(std::abs(dy), 3) + std::pow(std::abs(dz), 3)));

    dx *= denominator * repulsionFactor;
    dz *= denominator * repulsionFactor;

    adjustForce(forces, first, dx, dz);
    adjustForce(forces, second, -dx, -dz);
}

/**
 * A single pass of the force simulation.
 * Attracts comparable concepts and repels incomparable ones.
 */
void update(
    std::vector<float>& layout,
    std::vector<ForcePoint>& forces,
    float attractionFactor,
    float repulsionFactor,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation
) {
    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        auto comparableConcepts = getComparableConcepts(conceptIndex, subconceptsRelation, superconceptsRelation);

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

/**
 * Runs multiple update steps and updates the progress observer
*/
void multiUpdate(
    int updatesCount,
    std::vector<float>& layout,
    std::vector<ForcePoint>& forces,
    float attractionFactor,
    float repulsionFactor,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    ProgressData& progress
) {
    progress.beginBlock(updatesCount);

    for (int i = 0; i < updatesCount; i++) {
        update(layout, forces, attractionFactor, repulsionFactor, conceptsCount, subconceptsRelation, superconceptsRelation);

        progress.progress(i + 1);
    }

    progress.finishBlock();
}

/**
 * Main entry point for the Freese Layout algorithm.
 * Phases: 
 * 1. Rank assignment.
 * 2. Circular initialization.
 * 3. Force refinement (3 stages with different force weights).
 * 4. Final normalization.
 */
void computeFreeseLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    std::function<void(double)> onProgress
) {
    long long startTime = nowMills();

    auto progress = ProgressData(3, onProgress);

    auto ranksResult = assignRanksToNodes(conceptsCount, supremum, infimum, subconceptsRelation, superconceptsRelation);
    auto& [ranksMapping, rankCounts] = *ranksResult;
    auto forces = std::make_unique<std::vector<ForcePoint>>();

    forces->resize(conceptsCount);

    // Normalize factors based on lattice size
    float attractionFactor = ATTRACTION_CONSTANT / std::sqrt(conceptsCount);
    float repulsionFactor = REPULSION_CONSTANT / std::sqrt(conceptsCount);

    int singleIterationUpdatesCount = ITERATIONS + conceptsCount;
    int totalUpdatesCount = 3 * singleIterationUpdatesCount;

    initializeLayout(result.value, conceptsCount, ranksMapping, rankCounts);

    // Stage 1: Strong repulsion to spread nodes out
    multiUpdate(
        singleIterationUpdatesCount,
        result.value,
        *forces,
        attractionFactor * 0.5,
        repulsionFactor * 3,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        progress);

    // Stage 2: Strong attraction to align the lattice structure
    multiUpdate(
        singleIterationUpdatesCount,
        result.value,
        *forces,
        attractionFactor * 3,
        repulsionFactor * 0.5,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        progress);

    // Stage 3: Balanced forces for final settling
    multiUpdate(
        singleIterationUpdatesCount,
        result.value,
        *forces,
        attractionFactor * 0.75,
        repulsionFactor * 1.5,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        progress);

    normalizeDistances(result.value, conceptsCount, supremum, infimum, ranksMapping, rankCounts);

    long long endTime = nowMills();

    result.time = (int)(endTime - startTime);
}