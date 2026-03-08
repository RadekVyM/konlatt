// Implementation of the Concepts Cover algorithm:
// - https://books.google.cz/books?hl=cs&lr=&id=-F8OoVXQioAC&oi=fnd&pg=PR9&ots=0spFK_kxlS&sig=JOgqZUvytyQSFL7aiKtLgk1JLvE&redir_esc=y#v=onepage&q=concepts%20cover&f=false
// - https://www.researchgate.net/publication/220693390_Romano_G_Concept_Data_Analysis_Theory_and_Applications_Wiley_New_York

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

// It is annoying to pass the formal context data to the functions like this,
// but it is the fastest and simplest way

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

    // Map extents to their concept index for O(log N) lookup
    std::map<std::vector<int>, int> conceptsMap;
    for (int i = 0; i < concepts.size(); i++) {
        conceptsMap.insert({ concepts[i].getObjectsCopy(), i });
    }

    result.value.resize(concepts.size());

    // counts[j] tracks how many attributes 'm' result in the intersection 
    // that matches concepts[j]'s extent.
    std::vector<int> counts(concepts.size(), 0);
    std::vector<int> intersection;
    intersection.reserve(contextObjectsCount);

#ifdef __EMSCRIPTEN__
    int progressStep = concepts.size() / 100;
#endif

    // Iterate through each concept to find its direct children in the lattice
    for (int i = 0; i < concepts.size(); i++) {
        std::fill(counts.begin(), counts.end(), 0);

#ifdef __EMSCRIPTEN__
        if ((progressStep == 0 || i % progressStep == 0) && !onProgress.isUndefined()) {
            onProgress((double)i / concepts.size());
        }
#endif

        int conceptAttributesCount = concepts[i].getAttributes().size();
        int ignoredConceptAttributeIndex = 0;

        // Check every attribute 'm' in the formal context
        for (int m = 0; m < contextAttributesCount; m++) {
            // Optimization: If attribute 'm' is already in the current concept's (concepts[i]) intent, skip it.
            if (ignoredConceptAttributeIndex < conceptAttributesCount) {
                int ignoredAttribute = concepts[i].getAttributes()[ignoredConceptAttributeIndex];

                if (ignoredAttribute == m) {
                    ignoredConceptAttributeIndex++;
                    continue;
                }
            }

            // Find the intersection of the current concept's (concepts[i]) extent with the attribute 'm'
            // Intersection = { objects in concept[i] | object has attribute m }
            intersection.clear();
            for (int object : concepts[i].getObjects()) {
                if (formalContextHasAttribute(
                    contextMatrix,
                    cellSize,
                    cellsPerObject,
                    object,
                    m
                )) {
                    intersection.push_back(object);
                }
            }

            // Identify which concept (anotherConceptIndex) has this specific extent (intersection)
            int anotherConceptIndex = conceptsMap.find(intersection)->second;
            counts[anotherConceptIndex] = counts[anotherConceptIndex] + 1;

            // THE COVER CONDITION:
            // A concept B is covered by concept A if the number of attributes 
            // that generate B's extent from A equals the difference in their intent sizes.
            // This ensures B is a maximal sub-concept (no concept exists between A and B).
            if (concepts[anotherConceptIndex].getAttributes().size() - conceptAttributesCount == counts[anotherConceptIndex]) {
                // Add an edge from concepts[anotherConceptIndex] to concepts[i]
                // Edge: anotherConceptIndex (sub-concept) -> i (super-concept)
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