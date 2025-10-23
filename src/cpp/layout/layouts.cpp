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

std::unique_ptr<std::vector<int>> jsTypedArrayToVector(const emscripten::val& intArray) {
    auto vec = std::make_unique<std::vector<int>>();

    unsigned int length = intArray["length"].as<unsigned int>();
    vec->resize(length);
    auto memory = emscripten::val::module_property("HEAPU8")["buffer"];
    auto memoryView = intArray["constructor"].new_(memory, reinterpret_cast<uintptr_t>(vec->data()), length);
    memoryView.call<void>("set", intArray);

    return vec;
}

std::unique_ptr<std::tuple<
    std::vector<std::unordered_set<int>>,
    std::vector<std::unordered_set<int>>
>> convertToCppMappings(
    int conceptsCount,
    const emscripten::val& subconceptsMappingTypedArray
) {
    auto flatSubconceptsMapping = jsTypedArrayToVector(subconceptsMappingTypedArray);

    auto result = std::make_unique<std::tuple<
        std::vector<std::unordered_set<int>>,
        std::vector<std::unordered_set<int>>>>();
    auto& [subconceptsMapping, superconceptsMapping] = *result;

    subconceptsMapping.resize(conceptsCount);
    superconceptsMapping.resize(conceptsCount);

    int i = 0;
    int currentConcept = 0;

    while (i < flatSubconceptsMapping->size()) {
        int count = (*flatSubconceptsMapping)[i];
        i++;

        for (int j = 0; j < count; j++) {
            int value = (*flatSubconceptsMapping)[i];
            subconceptsMapping[currentConcept].insert(value);
            superconceptsMapping[value].insert(currentConcept);

            i++;
        }

        currentConcept++;
    }

    return result;
}

void computeLayeredLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    const emscripten::val& subconceptsMappingTypedArray,
    std::string placement
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
) {
    auto mappings = convertToCppMappings(conceptsCount, subconceptsMappingTypedArray);
    auto& [subconceptsMapping, superconceptsMapping] = *mappings;

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
        subconceptsMapping,
        superconceptsMapping,
        placement,
        onProgressCallback);
}

void computeFreeseLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    const emscripten::val& subconceptsMappingTypedArray
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
) {
    auto mappings = convertToCppMappings(conceptsCount, subconceptsMappingTypedArray);
    auto& [subconceptsMapping, superconceptsMapping] = *mappings;

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
        subconceptsMapping,
        superconceptsMapping,
        onProgressCallback);
}

void computeReDrawLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    const emscripten::val& subconceptsMappingTypedArray,
    unsigned int seed,
    int targetDimension,
    bool parallelize
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
) {
    auto mappings = convertToCppMappings(conceptsCount, subconceptsMappingTypedArray);
    auto& [subconceptsMapping, superconceptsMapping] = *mappings;

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
        subconceptsMapping,
        superconceptsMapping,
        seed,
        targetDimension,
        parallelize,
        onProgressCallback);
}