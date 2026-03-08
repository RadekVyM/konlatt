// Implementation of the InClose algorithm:
// - https://www.researchgate.net/publication/228522038_In-Close_a_fast_algorithm_for_computing_formal_concepts

#include "utils.h"
#include "inClose.h"
#include "types/FormalConcept.h"
#include "types/TimedResult.h"

#include <iostream>
#include <memory>
#include <queue>
#include <vector>


// It is annoying to pass the formal context data to the functions like this,
// but it is the fastest and simplest way

/**
 * Checks if a concept has already been generated.
 * Returns `false` (not canonical) if the extent is found elsewhere.
 * Basically one-to-one implementation of the 3.2 section from the paper.
 */
bool isCannonical(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    FormalConcept& parentConcept,
    std::vector<int>& newExtentBuffer,
    int newExtentSize,
    int startingAttribute
) {
    std::vector<int>& parentConceptAttributes = parentConcept.getAttributes();

    // Iterate through blocks of columns between those already in the intent
    for (int k = parentConceptAttributes.size() - 1; k >= 0; k--) {
        for (int j = startingAttribute; j >= parentConceptAttributes[k] + 1; j--) {
            int h = 0;

            // Check if the current attribute j is shared by all objects in the new extent
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
            // If the extent is found (all objects share attribute j), it's not canonical
            if (h == newExtentSize) {
                return false;
            }
        }
        // Prepare to skip the column just iterated down to
        startingAttribute = parentConceptAttributes[k] - 1;
    }

    // Final search for the extent in the block of columns down to 0
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

/**
 * Core recursive implementation of In-Close.
 * Implementation of the 3.1 section from the paper.
 */
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

    // Iterate through attributes starting from the currentAttribute
    for (int j = currentAttribute; j < contextAttributesCount; j++) {
        int lastObjectIndex = 0;
        std::vector<int>& parentConceptObjects = formalConcepts[parentConceptIndex].getObjects();

        // Take those objects from the parentConcept that have attribute j, i.e. generate a new potential extent
        for (int i = 0; i < parentConceptObjects.size(); i++) {
            int object = parentConceptObjects[i];

            if (formalContextHasAttribute(contextMatrix, cellSize, cellsPerObject, object, j)) {
                newExtentBuffer[lastObjectIndex] = object;
                lastObjectIndex++;
            }
        }

        if (lastObjectIndex > 0) {
            // Case A: Extent didn't change -> Attribute j belongs to the current concept's intent
            if (lastObjectIndex == parentConceptObjects.size()) {
                std::vector<int>& attributes = formalConcepts[parentConceptIndex].getAttributes();
                attributes.push_back(j);
            }
            // Case B: Extent is a smaller non-empty intersection -> Check if this forms a new canonical concept
            else if (isCannonical(
                contextMatrix,
                cellSize,
                cellsPerObject,
                formalConcepts[parentConceptIndex],
                newExtentBuffer,
                lastObjectIndex,
                j - 1
            )) {
                formalConcepts.emplace_back();
                FormalConcept& newConcept = formalConcepts.back();

                // Inherit parent attributes and add the new qualifying attribute j
                std::vector<int> newIntent = formalConcepts[parentConceptIndex].getAttributesCopy();
                newIntent.push_back(j);
                newConcept.setAttributes(newIntent);

                // Set the newly filtered objects as the extent
                std::vector<int> newExtent(newExtentBuffer.begin(), newExtentBuffer.begin() + lastObjectIndex);
                newConcept.setObjects(newExtent);

                newConcept.setAttribute(j);

                // Queue this concept for further recursive calls
                conceptsQueue.push(formalConcepts.size() - 1);
            }
        }
    }

#ifdef __EMSCRIPTEN__
    int progressCounter = 0;
    int progressStepsCount = conceptsQueue.size() + 1;
#endif

    // Recursively process each new concept discovered in the loop above
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
            formalConcepts[conceptIndex].getAttribute() + 1
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

    // Temporary buffer to reuse memory for extent calculations
    std::vector<int> newExtentBuffer;
    newExtentBuffer.resize(contextObjectsCount);

    // Create the initial concept: contains all objects, intent is empty
    std::vector<int> initialConceptObjects;
    initialConceptObjects.reserve(contextObjectsCount);
    for (int i = 0; i < contextObjectsCount; i++) {
        initialConceptObjects.push_back(i);
    }

    FormalConcept initialConcept = FormalConcept();
    initialConcept.setObjects(initialConceptObjects);
    initialConcept.setAttribute(0);

    result.value.push_back(initialConcept);

    // Start recursive processing from the first concept (index 0)
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

    // Edge case: Handle the concept containing all attributes if no object possesses all of them
    if (!hasObjectWithAllAttributes(
        contextMatrix,
        cellSize,
        cellsPerObject,
        contextObjectsCount,
        contextAttributesCount
    )) {
        std::vector<int> conceptAttributes;
        conceptAttributes.resize(contextAttributesCount);
        for (int i = 0; i < contextAttributesCount; i++) {
            conceptAttributes[i] = i;
        }

        FormalConcept allAttributesConcept = FormalConcept();
        allAttributesConcept.setAttributes(conceptAttributes);
        allAttributesConcept.setAttribute(0);

        result.value.push_back(allAttributesConcept);
    }

    long long endTime = nowMills();

#ifdef __EMSCRIPTEN__
    if (!onProgress.isUndefined()) {
        onProgress(1);
    }
#endif

    result.time = (int)endTime - startTime;
}
