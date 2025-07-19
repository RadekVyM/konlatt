#ifndef LAYOUTS_H
#define LAYOUTS_H

#include <vector>
#include <emscripten/val.h>
#include "../types/TimedResult.h"

void computeLayeredLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    emscripten::val const & superconceptsMappingTypedArray
);

void computeFreeseLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    const emscripten::val& subconceptsMappingTypedArray
);

#endif