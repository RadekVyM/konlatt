#include "../utils.h"
#include "../types/TimedResult.h"
#include "utils.h"
#include "layers.h"
#include "reDrawLayout.h"

#define _USE_MATH_DEFINES

#include <stdio.h>
#include <cmath>
#include <random>
#include <memory>
#include <vector>
#include <algorithm>
#include <Eigen/Dense>

#define INITIAL_DIMENSION 5
#define ITERATIONS_COUNT 1000
#define C_VERT 1
#define C_HOR 5
#define C_PAR 0.005
#define C_ANG 0.05
#define C_DIST 1
#define DELTA 0.001

int getLayoutDimension(int dimension) {
    return std::max(dimension, COORDS_COUNT);
}

int getStart(int dimension, int index) {
    return index * getLayoutDimension(dimension);
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
        float first = layout[getStart(dimension, firstIndex) + offset + i];
        float second = layout[getStart(dimension, secondIndex) + offset + i];
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
    std::vector<float> vec;
    vec.resize(count);

    for (int i = 0; i < count; i++) {
        float first = layout[getStart(dimension, firstIndex) + offset + i];
        float second = layout[getStart(dimension, secondIndex) + offset + i];
        vec[i] = first - second;
    }

    return vec;
}

std::vector<float> multiplyVector(std::vector<float> vec, double factor) {
    for (float& element : vec) {
        element *= factor;
    }

    return vec;
}

void resetForces(
    std::vector<float>& forces,
    int conceptsCount,
    int dimension
) {
    forces.resize(conceptsCount * getLayoutDimension(dimension));

    for (int i = 0; i < conceptsCount * getLayoutDimension(dimension); i++) {
        forces[i] = 0;
    }
}

void nodeStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    for (int startConceptIndex = 0; startConceptIndex < conceptsCount; startConceptIndex++) {
        // Vertical forces
        for (int endConceptIndex : subconceptsMapping[startConceptIndex]) {
            double verticalDistance = distance(layout, dimension, startConceptIndex, endConceptIndex, 0, 1);
            double horizontalDistance = distance(layout, dimension, startConceptIndex, endConceptIndex, 1, dimension - 1);
            double spring = -C_VERT * ((1 + horizontalDistance) / verticalDistance - 1);
            double force = DELTA * spring;

            // add force
        }

        auto comparableConcepts = getComparableConcepts(startConceptIndex, subconceptsMapping, superconceptsMapping);

        for (int comp : *comparableConcepts) {
            double dist = distance(layout, dimension, startConceptIndex, comp, 1, dimension - 1);
            double factor = std::min(std::pow(dist, 2), (double)C_HOR) * DELTA;
            auto direction = difference(layout, dimension, comp, startConceptIndex, 1, dimension - 1);

            // add forces
            multiplyVector(direction, factor);
            multiplyVector(direction, -factor);
        }

        for (int incomp = 0; incomp < conceptsCount; incomp++) {
            if (incomp == startConceptIndex || comparableConcepts->count(incomp)) {
                continue;
            }

            double verticalDistance = distance(layout, dimension, startConceptIndex, incomp, 0, 1);
            double horizontalDistance = distance(layout, dimension, incomp, startConceptIndex, 1, dimension - 1);

            if (horizontalDistance != 0) {
                double spring = -(C_HOR / (horizontalDistance)) * DELTA;
                auto direction = difference(layout, dimension, incomp, startConceptIndex, 1, dimension - 1);
                direction = multiplyVector(direction, 1 / horizontalDistance);

                // add forces
                multiplyVector(direction, spring);
                multiplyVector(direction, -spring);
            }
        }
    }

    // apply forces
}

void multiNodeStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    resetForces(forces, conceptsCount, dimension);

    for (int i = 0; i < ITERATIONS_COUNT; i++) {
        nodeStep(layout, forces, conceptsCount, dimension, subconceptsMapping, superconceptsMapping);
    }
}

void lineStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {

}

void multiLineStep(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping
) {
    resetForces(forces, conceptsCount, dimension);

    for (int i = 0; i < ITERATIONS_COUNT; i++) {
        lineStep(layout, forces, conceptsCount, dimension, subconceptsMapping, superconceptsMapping);
    }
}

void round(
    std::vector<float>& layout,
    std::vector<float>& forces,
    int conceptsCount,
    int dimension,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    bool parallelize
) {
    multiNodeStep(layout, forces, conceptsCount, dimension, subconceptsMapping, superconceptsMapping);

    if (parallelize) {
        multiLineStep(layout, forces, conceptsCount, dimension, subconceptsMapping, superconceptsMapping);
    }
}

void initializeLayout(
    std::vector<float>& layout,
    int conceptsCount,
    int dimension,
    int startConceptIndex,
    std::vector<std::unordered_set<int>>& coverRelation
) {
    layout.resize(getLayoutDimension(dimension) * conceptsCount);

    // Random number generation setup
    std::random_device rd;
    std::mt19937 gen(rd());
    // Uniform distribution for numbers between -0.5 and 0.5
    std::uniform_real_distribution<> distrib(-0.5, 0.5);

    auto topologicalOrder = topologicalSort(startConceptIndex, coverRelation);

    for (int i = 0; i < topologicalOrder->size(); i++) {
        int conceptIndex = (*topologicalOrder)[i];
        int start = getStart(dimension, conceptIndex);

        layout[start] = i;

        for (int j = 1; j < dimension; j++) {
            layout[start + j] = distrib(gen);
        }
    }
}

void finalizeLayout(std::vector<float>& layout, int conceptsCount, int targetDimension) {
    for (int i = 0; i < conceptsCount; i++) {
        int start = i * COORDS_COUNT;
        float y = layout[start];

        layout[start] = layout[start + 1];
        layout[start + 1] = y;

        if (targetDimension == 2) {
            layout[start + 2] = 0;
        }
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
    // Rows are concepts
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
    std::function<void(double)> onProgress
) {
    int targetDimension = 2;

    long long startTime = nowMills();

    initializeLayout(result.value, conceptsCount, INITIAL_DIMENSION, infimum, superconceptsMapping);
    std::vector<float> forces;

    for (int dimension = INITIAL_DIMENSION; dimension >= targetDimension; dimension--) {
        round(
            result.value,
            forces,
            conceptsCount,
            dimension,
            subconceptsMapping,
            superconceptsMapping,
            true);

        if (dimension != targetDimension) {
            reduceDimension(result.value, conceptsCount, dimension);
        }
    }

    finalizeLayout(result.value, conceptsCount, targetDimension);

    long long endTime = nowMills();

    result.time = (int)(endTime - startTime);
}