#ifndef LATTICE_H
#define LATTICE_H

#include "types/FormalConcept.h"
#include "types/TimedResult.h"
#include <vector>

#ifdef __EMSCRIPTEN__
#include "types/OnProgressCallback.h"
#endif

template struct TimedResult<std::vector<std::vector<int>>>;

void conceptsCover(
    TimedResult<std::vector<std::vector<int>>>& result,
    std::vector<IndexedFormalConcept>& concepts,
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