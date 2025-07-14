#include "../types/TimedResult.h"
#include "../utils.h"
#include "layeredLayout.h"
#include "freeseLayout.h"
#include "layouts.h"

#include <emscripten/emscripten.h>
#include <emscripten/val.h>
#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>

using namespace emscripten;
using namespace std;

std::unique_ptr<std::vector<int>> jsTypedArrayToVector(const emscripten::val& intArray) {
    auto vec = make_unique<std::vector<int>>();

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

    auto result = make_unique<std::tuple<
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
    const emscripten::val& subconceptsMappingTypedArray
) {
    auto mappings = convertToCppMappings(conceptsCount, subconceptsMappingTypedArray);
    auto& [subconceptsMapping, superconceptsMapping] = *mappings;

    computeLayeredLayout(
        result,
        supremum,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping);
}

void computeFreeseLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    const emscripten::val& subconceptsMappingTypedArray
) {
    auto mappings = convertToCppMappings(conceptsCount, subconceptsMappingTypedArray);
    auto& [subconceptsMapping, superconceptsMapping] = *mappings;

    computeFreeseLayout(
        result,
        supremum,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping);
}