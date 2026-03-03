#ifndef LAYOUTS_H
#define LAYOUTS_H

#include <vector>
#include <emscripten/val.h>
#include "../types/TimedResult.h"

#ifdef __EMSCRIPTEN__
#include "../types/OnProgressCallback.h"
#endif

void computeLayeredLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int conceptsCount,
    emscripten::val const & superconceptsRelationTypedArray,
    std::string placement
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
);

void computeFreeseLayoutJs(
    TimedResult<std::vector<float>>& result,
    int supremum,
    int infimum,
    int conceptsCount,
    const emscripten::val& subconceptsRelationTypedArray
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
);

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
);

#endif