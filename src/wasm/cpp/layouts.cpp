#include "TimedResult.h"
#include "layeredLayout.h"
#include "utils.h"
#include "layouts.h"

#include <emscripten/emscripten.h>
#include <stdio.h>
#include <vector>
#include <memory>
#include <unordered_set>

using namespace emscripten;
using namespace std;

void copyTypedArrayToVector(const emscripten::val &typedArray, vector<int> &vec)
{
    // https://github.com/emscripten-core/emscripten/issues/5519#issuecomment-333302296
    unsigned int length = typedArray["length"].as<unsigned int>();
    vec.reserve(length);
    
    emscripten::val heap = val::module_property("HEAPU8");
    emscripten::val memory = heap["buffer"];
    emscripten::val memoryView = val::global("Int32Array").new_(memory, reinterpret_cast<uintptr_t>(vec.data()), length);

    memoryView.call<void>("set", typedArray);

    std::cout << "hello " << vec.size() << std::endl;
    std::cout << "world " << length << std::endl;
}

std::unique_ptr<std::vector<int>> jsArrayToFlatSubconceptsMapping(emscripten::val const & subconceptsMappingTypedArray) {
    auto flatSubconceptsMapping = make_unique<std::vector<int>>();
    copyTypedArrayToVector(subconceptsMappingTypedArray, *flatSubconceptsMapping);
    return flatSubconceptsMapping;
}

std::unique_ptr<std::tuple<
    std::vector<std::unordered_set<int>>,
    std::vector<std::unordered_set<int>>
>> convertToCppMappings(
    int conceptsCount,
    //emscripten::val const & subconceptsMappingTypedArray
    const std::vector<int>& flatSuperconceptsMapping
) {
    //auto flatSubconceptsMapping = jsArrayToFlatSubconceptsMapping(subconceptsMappingTypedArray);

    auto result = make_unique<std::tuple<
        std::vector<std::unordered_set<int>>,
        std::vector<std::unordered_set<int>>>>();
    auto& [subconceptsMapping, superconceptsMapping] = *result;

    subconceptsMapping.resize(conceptsCount);
    superconceptsMapping.resize(conceptsCount);

    int i = 0;
    int currentConcept = 0;

    while (i < flatSuperconceptsMapping.size()) {
        int count = flatSuperconceptsMapping[i];
        i++;

        for (int j = 0; j < count; j++) {
            int value = flatSuperconceptsMapping[i];
            superconceptsMapping[currentConcept].insert(value);
            subconceptsMapping[value].insert(currentConcept);

            i++;
        }

        currentConcept++;
    }

    return result;
}

TimedResult<std::vector<float>> computeLayeredLayoutJs(
    int supremum,
    int conceptsCount,
    //emscripten::val const & superconceptsMappingTypedArray
    const std::vector<int>& flatSuperconceptsMapping
) {
    auto result = convertToCppMappings(conceptsCount, flatSuperconceptsMapping);
    auto& [subconceptsMapping, superconceptsMapping] = *result;

    return computeLayeredLayout(
        supremum,
        conceptsCount,
        subconceptsMapping,
        superconceptsMapping);
}