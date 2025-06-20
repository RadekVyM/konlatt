#ifndef LATTICE_H
#define LATTICE_H

#include "FormalConcept.h"
#include "TimedResult.h"
#include <vector>

#ifdef __EMSCRIPTEN__
#include "OnProgressCallback.h"
#endif

template struct TimedResult<std::vector<std::vector<int>>>;

TimedResult<std::vector<std::vector<int>>> conceptsToLattice(std::vector<IndexedFormalConcept>& concepts);

TimedResult<std::vector<std::vector<int>>> conceptsCover(
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