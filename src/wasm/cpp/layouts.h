#ifndef LAYOUTS_H
#define LAYOUTS_H

#include <vector>
#include <emscripten/emscripten.h>
#include "TimedResult.h"

TimedResult<std::vector<float>> computeLayeredLayoutJs(
    int supremum,
    int conceptsCount,
    //emscripten::val const & superconceptsMappingTypedArray
    const std::vector<int>& flatSuperconceptsMapping
);

#endif