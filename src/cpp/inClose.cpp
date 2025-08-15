#include "utils.h"
#include "inClose.h"
#include "types/FormalConcept.h"
#include "types/TimedResult.h"

#include <iostream>
#include <memory>
#include <queue>
#include <vector>
#include <numeric>

bool isCannonical(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    FormalConcept& parentConcept,
    std::vector<int>& newExtentBuffer,
    int newExtentSize,
    int startingAttribute
) {
    std::vector<int>& parentConceptAttributes = parentConcept.attributes;

    for (int k = parentConceptAttributes.size() - 1; k >= 0; k--) {
        for (int j = startingAttribute; j >= parentConceptAttributes[k] + 1; j--) {
            int h = 0;

            for (h = 0; h < newExtentSize; h++) {
                if (!formalContextHasAttribute(
                    contextMatrix,
                    cellSize,
                    cellsPerObject,
                    newExtentBuffer[h],
                    j
                ))
                    break;
            }
            if (h == newExtentSize) {
                return false;
            }
        }
        startingAttribute = parentConceptAttributes[k] - 1;
    }

    for (int j = startingAttribute; j >= 0; j--) {
        int h = 0;

        for (h = 0; h < newExtentSize; h++) {
            if (!formalContextHasAttribute(
                contextMatrix,
                cellSize,
                cellsPerObject,
                newExtentBuffer[h],
                j
            ))
                break;
        }
        if (h == newExtentSize) {
            return false;
        }
    }

    return true;
}

void inCloseImpl(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int contextObjectsCount,
    int contextAttributesCount,
    std::vector<int>& newExtentBuffer,
    std::vector<FormalConcept>& formalConcepts,
    int parentConceptIndex,
    int currentAttribute
#ifdef __EMSCRIPTEN__
    , OnProgressCallback& onProgress,
    bool callOnProgress
#endif
) {
    std::queue<int> conceptsQueue;

    for (int j = currentAttribute; j < contextAttributesCount; j++) {
        int lastObjectIndex = 0;
        std::vector<int>& parentConceptObjects = formalConcepts[parentConceptIndex].objects;

        // Take those objects from the parentConcept that have attribute j, i.e. generate a new potential extent
        for (int i = 0; i < parentConceptObjects.size(); i++) {
            int object = parentConceptObjects[i];

            if (formalContextHasAttribute(contextMatrix, cellSize, cellsPerObject, object, j)) {
                newExtentBuffer[lastObjectIndex] = object;
                lastObjectIndex++;
            }
        }

        if (lastObjectIndex > 0) {
            if (lastObjectIndex == parentConceptObjects.size()) {
                formalConcepts[parentConceptIndex].attributes.push_back(j);
            }
            else if (isCannonical(
                contextMatrix,
                cellSize,
                cellsPerObject,
                formalConcepts[parentConceptIndex],
                newExtentBuffer,
                lastObjectIndex,
                j - 1
            )) {
                formalConcepts.emplace_back(
                    std::vector<int>(newExtentBuffer.begin(), newExtentBuffer.begin() + lastObjectIndex),
                    [&](){
                        std::vector<int> attr = formalConcepts[parentConceptIndex].attributes;
                        attr.push_back(j);
                        return attr;
                    }(),
                    j);

                conceptsQueue.push(formalConcepts.size() - 1);
            }
        }
    }

#ifdef __EMSCRIPTEN__
    int progressCounter = 0;
    int progressStepsCount = conceptsQueue.size() + 1;
#endif

    while (!conceptsQueue.empty()) {
        int conceptIndex = conceptsQueue.front();

        inCloseImpl(
            contextMatrix,
            cellSize,
            cellsPerObject,
            contextObjectsCount,
            contextAttributesCount,
            newExtentBuffer,
            formalConcepts,
            conceptIndex,
            formalConcepts[conceptIndex].attribute + 1
#ifdef __EMSCRIPTEN__
            , onProgress,
            false
#endif
        );

#ifdef __EMSCRIPTEN__
        if (callOnProgress && !onProgress.isUndefined()) {
            progressCounter++;
            onProgress((double)progressCounter / progressStepsCount);
        }
#endif

        conceptsQueue.pop();
    }
}

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
) {
    //printFormalContext(contextMatrix, cellSize, cellsPerObject, contextObjectsCount, contextAttributesCount);

    long long startTime = nowMills();

    std::vector<int> newExtentBuffer;
    newExtentBuffer.resize(contextObjectsCount);

    std::vector<int> initialConceptObjects(contextObjectsCount);
    // This function fills a range with sequentially increasing values
    std::iota(initialConceptObjects.begin(), initialConceptObjects.end(), 0);

    result.value.emplace_back(std::move(initialConceptObjects), std::vector<int>(), 0);

    inCloseImpl(
        contextMatrix,
        cellSize,
        cellsPerObject,
        contextObjectsCount,
        contextAttributesCount,
        newExtentBuffer,
        result.value,
        0,
        0
#ifdef __EMSCRIPTEN__
        , onProgress,
        true
#endif
        );

    if (!hasObjectWithAllAttributes(
        contextMatrix,
        cellSize,
        cellsPerObject,
        contextObjectsCount,
        contextAttributesCount
    )) {
        std::vector<int> conceptAttributes(contextAttributesCount);
        std::iota(conceptAttributes.begin(), conceptAttributes.end(), 0);

        result.value.emplace_back(std::vector<int>(), std::move(conceptAttributes), 0);
    }

    long long endTime = nowMills();

#ifdef __EMSCRIPTEN__
    if (!onProgress.isUndefined()) {
        onProgress(1);
    }
#endif

    result.time = (int)endTime - startTime;
}
