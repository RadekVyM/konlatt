#ifndef INCLOSE_H
#define INCLOSE_H

#include "FormalConcept.h"
#include "TimedResult.h"
#include <vector>

#ifdef __EMSCRIPTEN__
#include "OnProgressCallback.h"
#endif

template struct TimedResult<std::vector<FormalConcept>>;

TimedResult<std::vector<FormalConcept>> inClose(
    std::vector<unsigned int> &contextMatrix,
    int cellSize,
    int cellsPerObject,
    int contextObjectsCount,
    int contextAttributesCount
#ifdef __EMSCRIPTEN__
    , OnProgressCallback onProgress
#endif
);

#endif