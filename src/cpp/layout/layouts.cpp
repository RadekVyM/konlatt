#include "../types/TimedResult.h"
#include "../utils.h"
#include "layered/layeredLayout.h"
#include "freeseLayout.h"
#include "reDrawLayout.h"
#include "layouts.h"

#include <emscripten/emscripten.h>
#include <emscripten/val.h>
#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>

/**
 * Efficiently copies a JavaScript TypedArray (e.g., Int32Array) into a C++ std::vector.
 * Uses the Emscripten HEAP view to perform a direct memory copy.
 */
std::unique_ptr<std::vector<int>> jsTypedArrayToVector(const emscripten::val& intArray) {
    auto vec = std::make_unique<std::vector<int>>();

    unsigned int length = intArray["length"].as<unsigned int>();
    vec->resize(length);
    auto memory = emscripten::val::module_property("HEAPU8")["buffer"];
    auto memoryView = intArray["constructor"].new_(memory, reinterpret_cast<uintptr_t>(vec->data()), length);
    memoryView.call<void>("set", intArray);

    return vec;
}

/**
 * Converts a flat representation of the subconcept relation (from JS) into 
 * C++ adjacency lists (sets) for both subconcepts and superconcepts.
 * * Input format: [count, val1, val2, ..., count, val1, ...]
 */
std::unique_ptr<std::tuple<
    std::vector<std::unordered_set<int>>,
    std::vector<std::unordered_set<int>>
>> convertToCppRelations(
    int conceptsCount,
    const emscripten::val& subconceptsRelationTypedArray
) {
    auto flatSubconceptsRelation = jsTypedArrayToVector(subconceptsRelationTypedArray);

    auto result = std::make_unique<std::tuple<
        std::vector<std::unordered_set<int>>,
        std::vector<std::unordered_set<int>>>>();
    auto& [subconceptsRelation, superconceptsRelation] = *result;

    subconceptsRelation.resize(conceptsCount);
    superconceptsRelation.resize(conceptsCount);

    int i = 0;
    int currentConcept = 0;

    // Parse the flat vector into adjacency sets
    while (i < flatSubconceptsRelation->size()) {
        // Number of relations for this concept
        int count = (*flatSubconceptsRelation)[i];
        i++;

        for (int j = 0; j < count; j++) {
            int value = (*flatSubconceptsRelation)[i];
            subconceptsRelation[currentConcept].insert(value);
            superconceptsRelation[value].insert(currentConcept);

            i++;
        }

        currentConcept++;
    }

    return result;
}

/**
 * JS wrapper for the layered layout algorithm.
 */
void computeLayeredLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    const emscripten::val& subconceptsRelationTypedArray,
    std::string placement
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
) {
    auto relations = convertToCppRelations(conceptsCount, subconceptsRelationTypedArray);
    auto& [subconceptsRelation, superconceptsRelation] = *relations;

    auto onProgressCallback = [&onProgress](double value) {
#ifdef __EMSCRIPTEN__
        if (!onProgress.isUndefined()) {
            onProgress(value);
        }
#endif
    };

    computeLayeredLayout(
        result,
        supremum,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        placement,
        onProgressCallback);
}

/**
 * JS wrapper for the Freese layout algorithm.
 */
void computeFreeseLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    const emscripten::val& subconceptsRelationTypedArray
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
) {
    auto relations = convertToCppRelations(conceptsCount, subconceptsRelationTypedArray);
    auto& [subconceptsRelation, superconceptsRelation] = *relations;

    auto onProgressCallback = [&onProgress](double value) {
#ifdef __EMSCRIPTEN__
        if (!onProgress.isUndefined()) {
            onProgress(value);
        }
#endif
    };

    computeFreeseLayout(
        result,
        supremum,
        infimum,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        onProgressCallback);
}

/**
 * JS wrapper for the ReDraw layout algorithm.
 */
void computeReDrawLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    const emscripten::val& subconceptsRelationTypedArray,
    unsigned int seed,
    int targetDimension,
    bool parallelize
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
) {
    auto relations = convertToCppRelations(conceptsCount, subconceptsRelationTypedArray);
    auto& [subconceptsRelation, superconceptsRelation] = *relations;

    auto onProgressCallback = [&onProgress](double value) {
#ifdef __EMSCRIPTEN__
        if (!onProgress.isUndefined()) {
            onProgress(value);
        }
#endif
    };

    computeReDrawLayout(
        result,
        supremum,
        infimum,
        conceptsCount,
        subconceptsRelation,
        superconceptsRelation,
        seed,
        targetDimension,
        parallelize,
        onProgressCallback);
}