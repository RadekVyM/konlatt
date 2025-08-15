#include "types/FormalConcept.h"
#include "utils.h"
#include "conceptsCover.h"

#include <stdio.h>
#include <iostream>
#include <vector>
#include <algorithm>
#include <memory>
#include <unordered_set>
#include <map>

void conceptsCover(
    TimedResult<std::vector<std::vector<int>>>& result,
    std::vector<SimpleFormalConcept>& concepts,
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

    std::map<std::vector<int>, int> conceptsMap;

    for (int i = 0; i < concepts.size(); i++) {
        conceptsMap.insert({ concepts[i].getObjectsCopy(), i });
    }

    result.value.resize(concepts.size());

    std::vector<int> counts(concepts.size(), 0);
    std::vector<int> inters;
    inters.reserve(contextObjectsCount);

#ifdef __EMSCRIPTEN__
    int progressStep = concepts.size() / 100;
#endif

    for (int i = 0; i < concepts.size(); i++) {
        std::fill(counts.begin(), counts.end(), 0);

#ifdef __EMSCRIPTEN__
        if ((progressStep == 0 || i % progressStep == 0) && !onProgress.isUndefined()) {
            onProgress((double)i / concepts.size());
        }
#endif

        int conceptAttributesCount = concepts[i].getAttributes().size();
        int ignoredConceptAttributeIndex = 0;

        for (int m = 0; m < contextAttributesCount; m++) {
            // ignore all the attributes of concepts[i]
            if (ignoredConceptAttributeIndex < conceptAttributesCount) {
                int ignoredAttribute = concepts[i].getAttributes()[ignoredConceptAttributeIndex];

                if (ignoredAttribute == m) {
                    ignoredConceptAttributeIndex++;
                    continue;
                }
            }

            // all objects of concepts[i] that have attribute m
            inters.clear();
            for (int object : concepts[i].getObjects()) {
                if (formalContextHasAttribute(
                    contextMatrix,
                    cellSize,
                    cellsPerObject,
                    object,
                    m
                )) {
                    inters.push_back(object);
                }
            }

            // getting concept whose extent is equal to inters
            int anotherConceptIndex = conceptsMap.find(inters)->second;
            counts[anotherConceptIndex] = counts[anotherConceptIndex] + 1;

            if (concepts[anotherConceptIndex].getAttributes().size() - conceptAttributesCount == counts[anotherConceptIndex]) {
                // add an edge from concepts[anotherConceptIndex] to concepts[i]
                result.value[anotherConceptIndex].push_back(i);
            }
        }
    }

    long long endTime = nowMills();

#ifdef __EMSCRIPTEN__
    if (!onProgress.isUndefined()) {
        onProgress(1);
    }
#endif

    result.time = (int)endTime - startTime;
}