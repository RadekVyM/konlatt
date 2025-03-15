#include "utils.h"
#include "inClose.h"
#include "FormalConcept.h"
#include "TimedResult.h"

#include <iostream>
#include <memory>
#include <queue>
#include <vector>

using namespace std;

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
) {
    std::queue<int> conceptsQueue;

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
            if (lastObjectIndex == parentConceptObjects.size()) {
                std::vector<int>& attributes = formalConcepts[parentConceptIndex].getAttributes();
                attributes.push_back(j);
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
            
                std::vector<int> newIntent = formalConcepts[parentConceptIndex].getAttributesCopy();
                newIntent.push_back(j);
                std::vector<int> newExtent(newExtentBuffer.begin(), newExtentBuffer.begin() + lastObjectIndex);

                FormalConcept newConcept = FormalConcept();
                newConcept.setAttributes(newIntent);
                newConcept.setObjects(newExtent);
                newConcept.setAttribute(j);

                formalConcepts.push_back(newConcept);
                conceptsQueue.push(formalConcepts.size() - 1);
            }
        }
    }

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
            formalConcepts[conceptIndex].getAttribute() + 1);

        conceptsQueue.pop();
    }
}

TimedResult<std::vector<FormalConcept>> inClose(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int contextObjectsCount,
    int contextAttributesCount
) {
    //printFormalContext(contextMatrix, cellSize, cellsPerObject, contextObjectsCount, contextAttributesCount);

    long long startTime = nowMills();

    std::vector<int> newExtentBuffer;
    newExtentBuffer.resize(contextObjectsCount);

    std::vector<int> initialConceptObjects;
    initialConceptObjects.reserve(contextObjectsCount);
    for (int i = 0; i < contextObjectsCount; i++) {
        initialConceptObjects.push_back(i);
    }

    FormalConcept initialConcept = FormalConcept();
    initialConcept.setObjects(initialConceptObjects);
    initialConcept.setAttribute(0);

    std::unique_ptr<std::vector<FormalConcept>> formalConcepts = std::make_unique<std::vector<FormalConcept>>();

    formalConcepts->push_back(initialConcept);

    inCloseImpl(
        contextMatrix,
        cellSize,
        cellsPerObject,
        contextObjectsCount,
        contextAttributesCount,
        newExtentBuffer,
        *formalConcepts,
        0,
        0);

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

        formalConcepts->push_back(allAttributesConcept);
    }

    long long endTime = nowMills();

    return TimedResult<std::vector<FormalConcept>>(*formalConcepts, (int)endTime - startTime);
}
