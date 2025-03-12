#ifndef INCLOSE_H
#define INCLOSE_H

#include "FormalConcept.h"
#include <vector>

std::vector<FormalConcept> inClose(
    std::vector<unsigned int> &contextMatrix,
    int cellSize,
    int cellsPerObject,
    int contextObjectsCount,
    int contextAttributesCount
);

#endif