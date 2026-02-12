// Implementation of the ReDraw algorithm:
// - https://arxiv.org/pdf/2102.02684

// Based on the source code from: https://github.com/domduerr/redraw

#include "../utils.h"
#include "../types/TimedResult.h"
#include "../types/ProgressData.h"
#include "utils.h"
#include "layers.h"
#include "reDrawLayout.h"

#define _USE_MATH_DEFINES

#include <stdio.h>
#include <cmath>
#include <numeric>
#include <random>
#include <memory>
#include <vector>
#include <algorithm>
#include <limits>
#include <Eigen/Dense>

#define INITIAL_DIMENSION 5
#define ITERATIONS_COUNT 1000
#define C_VERT 1
#define C_HOR 5
#define C_PAR 0.005
#define C_ANG 0.05
#define C_DIST 1
#define DELTA 0.001
#define EPSILON 0.0025

// TODO: Clean up this file

int getLayoutDimension(int dimension) {
    return std::max(dimension, COORDS_COUNT);
}

int getStart(int dimension, int index) {
    return index * getLayoutDimension(dimension);
}

double dotProduct(const std::vector<float>& first, const std::vector<float>& second) {
    if (first.size() != second.size()) {
        throw std::invalid_argument("Vectors must have the same size for dot product.");
    }
    return std::inner_product(first.begin(), first.end(), second.begin(), 0.0);
}

double magnitude(const std::vector<float>& vec) {
    double sumSquared = 0.0;
    for (float value : vec) {
        sumSquared += value * value;
    }
    return std::sqrt(sumSquared);
}

double cosineSimilarity(const std::vector<float>& first, const std::vector<float>& second) {
    double dp = dotProduct(first, second);

    double firstMagnitude = magnitude(first);
    double secondMagnitude = magnitude(second);

    if (firstMagnitude == 0 || secondMagnitude == 0) {
        // Cosine similarity is undefined or often treated as 0 in this case.
        return 0;
    }

    return dp / (firstMagnitude * secondMagnitude);
}

double distance(
    std::vector<float>& layout,
    int dimension,
    int firstIndex,
    int secondIndex,
    int offset,
    int count
) {
    double sum = 0;

    for (int i = 0; i < count; i++) {
        double first = layout[getStart(dimension, firstIndex) + offset + i];
        double second = layout[getStart(dimension, secondIndex) + offset + i];
        double diff = first - second;

        sum += std::pow(diff, 2);
    }

    return std::sqrt(sum);
}

std::vector<float> difference(
    std::vector<float>& layout,
    int dimension,
    int firstIndex,
    int secondIndex,
    int offset,
    int count
) {
    std::vector<float> vec(count);

    for (int i = 0; i < count; i++) {
        float first = layout[getStart(dimension, firstIndex) + offset + i];
        float second = layout[getStart(dimension, secondIndex) + offset + i];
        vec[i] = first - second;
    }

    return vec;
}

std::vector<float> difference(const std::vector<float>& first, const std::vector<float>& second) {
    std::vector<float> result(first.size());

    for (int i = 0; i < first.size(); i++) {
        result[i] = first[i] - second[i];
    }

    return result;
}

std::vector<float> multiplyByScalar(std::vector<float> vec, double factor) {
    for (int i = 0; i < vec.size(); i++) {
        vec[i] *= factor;
    }

    return vec;
}

double length(const std::vector<float>& vec) {
    double sum = 0;

    for (int i = 0; i < vec.size(); i++) {
        sum += std::pow(vec[i], 2);
    }

    return std::sqrt(sum);
}

void resetForces(
    std::vector<float>& forces,
    int conceptsCount,
    int dimension
) {
    forces.resize(conceptsCount * getLayoutDimension(dimension));

    for (int i = 0; i < forces.size(); i++) {
        forces[i] = 0;
    }
}

void addForce(
    std::vector<float>& force,
    std::vector<float>& forces,
    int dimension,
    int index
) {
    int start = getStart(dimension, index);

    for (int i = 0; i < dimension; i++) {
        forces[start + i] += force[i];
    }
}

void addVForce(
    float force,
    std::vector<float>& forces,
    int dimension,
    int index
) {
    forces[getStart(dimension, index)] += force;
}

void addHForce(
    std::vector<float>& force,
    std::vector<float>& forces,
    int dimension,
    int index
) {
    int start = getStart(dimension, index);

    for (int i = 0; i < dimension - 1; i++) {
        forces[start + i + 1] += force[i];
    }
}

float applyForces(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    float forcesSum = 0;

    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        int start = getStart(dimension, conceptIndex);
        float tempY = layout[start];

        for (int i = 0; i < dimension; i++) {
            layout[start + i] += forces[start + i];
            forcesSum += std::abs(forces[start + i]);
        }

        if (forces[start] > 0) {
            float upperb = std::numeric_limits<float>::max();
            bool hasPredecessor = false;

            for (int superconcept : superconceptsMapping[conceptIndex]) {
                upperb = std::min(upperb, layout[getStart(dimension, superconcept)]);
                hasPredecessor = true;
            }
            if (hasPredecessor) {
                upperb -= 0.1;
            }

            if (layout[start] > upperb) {
                layout[start] = (tempY + upperb) / 2;
            }
        }
        else {
            float lowerb = std::numeric_limits<float>::min();
            bool hasSuccessor = false;

            for (int subconcept : subconceptsMapping[conceptIndex]) {
                lowerb = std::max(lowerb, layout[getStart(dimension, subconcept)]);
                hasSuccessor = true;
            }
            if (hasSuccessor) {
                lowerb += 0.1;
            }

            if (layout[start] < lowerb) {
                layout[start] = (tempY + lowerb) / 2;
            }
        }
    }

    return forcesSum;
}

void correctOffset(
    std::vector<float>& layout,
    int conceptsCount,
    int dimension
) {
    std::vector<float> means(dimension - 1, 0);

    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        int start = getStart(dimension, conceptIndex);

        for (int i = 0; i < means.size(); i++) {
            means[i] += layout[start + i + 1];
        }
    }

    for (int i = 0; i < means.size(); i++) {
        means[i] /= conceptsCount;
    }

    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        int start = getStart(dimension, conceptIndex);

        for (int i = 0; i < means.size(); i++) {
            layout[start + i + 1] -= means[i];
        }
    }
}

float nodeStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        // Vertical forces
        for (int endConceptIndex : subconceptsMapping[conceptIndex]) {
            double verticalDistance = distance(layout, dimension, conceptIndex, endConceptIndex, 0, 1);
            double horizontalDistance = distance(layout, dimension, conceptIndex, endConceptIndex, 1, dimension - 1);

            if (verticalDistance == 0) {
                continue;
            }

            double spring = -C_VERT * ((1 + horizontalDistance) / verticalDistance - 1);
            double force = DELTA * spring;

            addVForce(-force, forces, dimension, conceptIndex);
            addVForce(force, forces, dimension, endConceptIndex);
        }

        auto comparableConcepts = getComparableConcepts(conceptIndex, subconceptsMapping, superconceptsMapping);

        // Attracting forces of chains (comparable elements)
        for (int comp : *comparableConcepts) {
            double dist = distance(layout, dimension, conceptIndex, comp, 1, dimension - 1);
            double factor = std::min(std::pow(dist, 2), (double)C_HOR) * DELTA;
            auto direction = difference(layout, dimension, comp, conceptIndex, 1, dimension - 1);

            auto startVec = multiplyByScalar(direction, factor);
            auto compVec = multiplyByScalar(direction, -factor);

            addHForce(startVec, forces, dimension, conceptIndex);
            addHForce(compVec, forces, dimension, comp);
        }

        // Repelling forces between incomparable elements
        for (int incomp = 0; incomp < conceptsCount; incomp++) {
            if (incomp == conceptIndex || comparableConcepts->count(incomp)) {
                continue;
            }

            double verticalDistance = distance(layout, dimension, conceptIndex, incomp, 0, 1);
            double horizontalDistance = distance(layout, dimension, incomp, conceptIndex, 1, dimension - 1);

            if (horizontalDistance != 0) {
                double spring = -(C_HOR / horizontalDistance) * DELTA;
                auto direction = difference(layout, dimension, incomp, conceptIndex, 1, dimension - 1);
                auto startVec = multiplyByScalar(direction, spring / horizontalDistance);
                auto incompVec = multiplyByScalar(direction, -spring / horizontalDistance);

                addHForce(startVec, forces, dimension, conceptIndex);
                addHForce(incompVec, forces, dimension, incomp);
            }
        }
    }

    return applyForces(layout, forces, conceptsCount, dimension, subconceptsMapping, superconceptsMapping);
}

void multiNodeStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    ProgressData& progress
) {
    progress.beginBlock(ITERATIONS_COUNT);

    for (int i = 0; i < ITERATIONS_COUNT; i++) {
        resetForces(forces, conceptsCount, dimension);

        float totalForce = nodeStep(
            layout,
            forces,
            conceptsCount,
            dimension,
            subconceptsMapping,
            superconceptsMapping);

        progress.progress(i + 1);

        if (totalForce < EPSILON) {
            break;
        }
    }

    progress.finishBlock();
}

std::vector<float> calculateLineForce(
    std::vector<float>& layout,
    int dimension,
    int firstFrom,
    int firstTo,
    int secondFrom,
    int secondTo,
    double similarity,
    double constant
) {
    auto firstVector = difference(layout, dimension, firstTo, firstFrom, 0, dimension);
    auto secondVector = difference(layout, dimension, firstTo, firstFrom, 0, dimension);

    double firstY = firstVector.front();
    double secondY = secondVector.front();

    std::vector<float> result(dimension - 1);

    if (firstY == 0 || secondY == 0) {
        return result;
    }

    double factor = 1 - similarity * 1 / constant;

    for (int i = 0; i < result.size(); i++) {
        result[i] = factor * ((firstVector[i + 1] / firstY) - (secondVector[i + 1] / secondY));
    }

    return result;
}

float lineStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    // TODO: Check if this is implemented correctly
    for (int firstFrom = 0; firstFrom < conceptsCount; firstFrom++) {
        for (int firstTo : subconceptsMapping[firstFrom]) {
            for (int secondFrom = 0; secondFrom < conceptsCount; secondFrom++) {
                for (int secondTo : subconceptsMapping[secondFrom]) {
                    if ((firstFrom == secondFrom && firstTo == secondTo) || firstFrom == firstTo || secondFrom == secondTo) {
                        continue;
                    }

                    auto firstVector = difference(layout, dimension, firstFrom, firstTo, 0, dimension);
                    auto secondVector = difference(layout, dimension, secondFrom, secondTo, 0, dimension);

                    if (allElementsEqualTo(firstVector, (float)0) || allElementsEqualTo(secondVector, (float)0)) {
                        continue;
                    }

                    double similarity = cosineSimilarity(firstVector, secondVector);

                    if (similarity < C_PAR) {
                        auto force = calculateLineForce(layout, dimension, firstFrom, firstTo, secondFrom, secondTo, similarity, C_PAR);
                        auto positiveForce = multiplyByScalar(force, DELTA);
                        auto negativeForce = multiplyByScalar(force, -DELTA);

                        addHForce(negativeForce, forces, dimension, firstFrom);
                        addHForce(positiveForce, forces, dimension, firstTo);
                        addHForce(positiveForce, forces, dimension, secondFrom);
                        addHForce(negativeForce, forces, dimension, secondTo);
                    }

                    if (0 < similarity && similarity < C_ANG) {
                        auto force = calculateLineForce(layout, dimension, firstFrom, firstTo, secondFrom, secondTo, similarity, C_ANG);
                        auto positiveForce = multiplyByScalar(force, DELTA);
                        auto negativeForce = multiplyByScalar(force, -DELTA);

                        if (firstFrom == secondFrom) {
                            addHForce(negativeForce, forces, dimension, firstTo);
                            addHForce(positiveForce, forces, dimension, secondTo);
                        }
                        if (firstTo == secondTo) {
                            addHForce(positiveForce, forces, dimension, firstFrom);
                            addHForce(negativeForce, forces, dimension, secondFrom);
                        }
                    }
                }
            }

            for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
                float conceptY = layout[getStart(dimension, conceptIndex)];

                if (layout[getStart(dimension, firstFrom)] > conceptY && conceptY > layout[getStart(dimension, firstTo)]) {
                    auto pa = difference(layout, dimension, conceptIndex, firstFrom, 0, dimension);
                    auto ba = difference(layout, dimension, firstTo, firstFrom, 0, dimension);

                    double t = dotProduct(pa, ba) / dotProduct(ba, ba);
                    auto bat = multiplyByScalar(ba, t);
                    auto diff = difference(pa, bat);
                    double dist = length(diff);

                    if (dist != 0 && dist < C_DIST) {
                        auto first = multiplyByScalar(diff, C_DIST / dist * DELTA);
                        auto second = multiplyByScalar(diff, -C_DIST / dist * DELTA / 2);

                        addForce(first, forces, dimension, conceptIndex);
                        addForce(second, forces, dimension, firstFrom);
                        addForce(second, forces, dimension, firstTo);
                    }
                }
            }
        }
    }

    return applyForces(layout, forces, conceptsCount, dimension, subconceptsMapping, superconceptsMapping);
}

void multiLineStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    ProgressData& progress
) {
    progress.beginBlock(ITERATIONS_COUNT);

    for (int i = 0; i < ITERATIONS_COUNT; i++) {
        resetForces(forces, conceptsCount, dimension);

        float totalForce = lineStep(
            layout,
            forces,
            conceptsCount,
            dimension,
            subconceptsMapping,
            superconceptsMapping);

        progress.progress(i + 1);

        if (totalForce < EPSILON) {
            break;
        }
    }

    progress.finishBlock();
}

void round(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    bool parallelize,
    ProgressData& progress
) {
    multiNodeStep(
        layout,
        forces,
        conceptsCount,
        dimension,
        subconceptsMapping,
        superconceptsMapping,
        progress);
    correctOffset(layout, conceptsCount, dimension);

    if (parallelize) {
        multiLineStep(
            layout,
            forces,
            conceptsCount,
            dimension,
            subconceptsMapping,
            superconceptsMapping,
            progress);
        correctOffset(layout, conceptsCount, dimension);
    }
}

void initializeLayout(
    std::vector<float>& layout,
    int conceptsCount,
    int dimension,
    int infimum,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    unsigned int seed
) {
    layout.resize(getLayoutDimension(dimension) * conceptsCount);

    // Random number generation setup
    std::mt19937 gen(seed);
    // Uniform distribution for numbers between -0.5 and 0.5
    std::uniform_real_distribution<> distrib(-0.5, 0.5);

    auto topologicalOrder = topologicalSort(infimum, superconceptsMapping);

    for (int i = 0; i < topologicalOrder->size(); i++) {
        // It is super important to assign the Y values in the opposite direction: topologicalOrder->size() - 1 - i
        int conceptIndex = (*topologicalOrder)[topologicalOrder->size() - 1 - i];
        int start = getStart(dimension, conceptIndex);

        layout[start] = i;

        for (int j = 1; j < dimension; j++) {
            layout[start + j] = distrib(gen);
        }
    }
}

void finalizeLayout(std::vector<float>& layout, int conceptsCount, int targetDimension) {
    float minX = std::numeric_limits<float>::max();
    float maxX = std::numeric_limits<float>::min();
    float minY = std::numeric_limits<float>::max();
    float maxY = std::numeric_limits<float>::min();
    float minZ = std::numeric_limits<float>::max();
    float maxZ = std::numeric_limits<float>::min();

    for (int i = 0; i < conceptsCount; i++) {
        int start = i * COORDS_COUNT;
        float y = layout[start];

        layout[start] = layout[start + 1];
        layout[start + 1] = y;

        if (targetDimension == 2) {
            layout[start + 2] = 0;
        }

        minX = std::min(minX, layout[start]);
        maxX = std::max(maxX, layout[start]);
        minY = std::min(minY, layout[start + 1]);
        maxY = std::max(maxY, layout[start + 1]);
        minZ = std::min(minZ, layout[start + 2]);
        maxZ = std::max(maxZ, layout[start + 2]);
    }

    float offsetX = minX + (std::abs(maxX - minX) / 2);
    float offsetY = minY + (std::abs(maxY - minY) / 2);
    float offsetZ = minZ + (std::abs(maxZ - minZ) / 2);

    for (int i = 0; i < conceptsCount; i++) {
        int start = i * COORDS_COUNT;
        layout[start] -= offsetX;
        layout[start + 1] -= offsetY;
        layout[start + 2] -= offsetZ;
    }
}

void reduceDimension(
    std::vector<float>& layout,
    int conceptsCount,
    int dimension
) {
    // Using PCA
    // https://en.wikipedia.org/wiki/Dimensionality_reduction#Principal_component_analysis_(PCA)
    // https://www.geeksforgeeks.org/data-analysis/principal-component-analysis-pca/
    // https://medium.com/@dareyadewumi650/understanding-the-role-of-eigenvectors-and-eigenvalues-in-pca-dimensionality-reduction-10186dad0c5c

    // Inspired by this implementation:
    // https://github.com/ogail/pca/blob/master/PrincipalComponentAnalysis/PrincipalComponentAnalysis/pca.h

    int newDimension = dimension - 1;

    // Create a matrix containing all coordinates except the y-coordinate for all concepts
    // Rows are concepts, columns are coordinates
    Eigen::MatrixXd data(conceptsCount, newDimension);

    for (int row = 0; row < conceptsCount; row++) {
        int layoutStart = getStart(dimension, row);

        for (int col = 0; col < newDimension; col++) {
            data(row, col) = layout[layoutStart + 1 + col];
        }
    }

    // Standardize the data
    Eigen::RowVectorXd mean = data.colwise().mean();
    Eigen::MatrixXd centeredData = data.rowwise() - mean;

    // Compute eigenvectors and eigenvalues
    Eigen::MatrixXd covarianceMatrix = (centeredData.transpose() * centeredData) / (conceptsCount - 1);
    Eigen::SelfAdjointEigenSolver<Eigen::MatrixXd> eigenSolver(covarianceMatrix);

    // Principal components are columns
    Eigen::MatrixXd eigenvectors = eigenSolver.eigenvectors().real();
    Eigen::VectorXd eigenvalues = eigenSolver.eigenvalues().real();

    std::vector<std::pair<double, Eigen::VectorXd>> eigenPairs;
    for (int i = 0; i < eigenvalues.size(); ++i) {
        eigenPairs.push_back({ eigenvalues(i), eigenvectors.col(i) });
    }

    // Sort in descending order of eigenvalues
    std::sort(eigenPairs.rbegin(), eigenPairs.rend(),
        [](const auto& a, const auto& b) { return a.first < b.first; });

    Eigen::MatrixXd principalComponents(centeredData.cols(), newDimension - 1);

    for (int i = 0; i < newDimension - 1; i++) {
        principalComponents.col(i) = eigenPairs[i].second;
    }

    Eigen::MatrixXd projectedCenteredData = centeredData * principalComponents;

    // Update the layout and reduce its dimension
    for (int conceptIndex = 0; conceptIndex < conceptsCount; conceptIndex++) {
        int oldLayoutStart = getStart(dimension, conceptIndex);
        int newLayoutStart = getStart(newDimension, conceptIndex);

        layout[newLayoutStart] = layout[oldLayoutStart];

        for (int col = 0; col < newDimension - 1; col++) {
            layout[newLayoutStart + col + 1] = projectedCenteredData(conceptIndex, col);
        }

        if (newDimension == 2) {
            layout[newLayoutStart + 2] = 0;
        }
    }

    layout.resize(conceptsCount * getLayoutDimension(newDimension));
}

void computeReDrawLayout(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    unsigned int seed,
    int targetDimension,
    bool parallelize,
    std::function<void(double)> onProgress
) {
    long long startTime = nowMills();

    auto progress = ProgressData(
        (INITIAL_DIMENSION - targetDimension + 1) * (parallelize ? 2 : 1),
        onProgress);

    initializeLayout(result.value, conceptsCount, INITIAL_DIMENSION, infimum, superconceptsMapping, seed);
    std::vector<float> forces;

    for (int dimension = INITIAL_DIMENSION; dimension >= targetDimension; dimension--) {
        round(
            result.value,
            forces,
            conceptsCount,
            dimension,
            subconceptsMapping,
            superconceptsMapping,
            parallelize,
            progress);

        if (dimension != targetDimension) {
            reduceDimension(result.value, conceptsCount, dimension);
        }
    }

    finalizeLayout(result.value, conceptsCount, targetDimension);

    long long endTime = nowMills();

    result.time = (int)(endTime - startTime);
}