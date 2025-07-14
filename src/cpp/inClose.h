#ifndef INCLOSE_H
#define INCLOSE_H

#include "types/FormalConcept.h"
#include "types/TimedResult.h"
#include <vector>

#ifdef __EMSCRIPTEN__
#include "types/OnProgressCallback.h"
#endif

template struct TimedResult<std::vector<FormalConcept>>;

void inClose(
    TimedResult<std::vector<FormalConcept>>& result,
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int contextObjectsCount,
    int contextAttributesCount
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
);

#endif