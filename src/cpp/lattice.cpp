#include "FormalConcept.h"
#include "LatticeItem.h"
#include "utils.h"

#include <stdio.h>
#include <iostream>
#include <sstream>

using namespace std;

std::vector<std::vector<int>> conceptsToLattice(std::vector<IndexedFormalConcept>& concepts) {
    // Concepts must be ordered by intent's length from longest to shortest
    std::sort(
        concepts.begin(),
        concepts.end(),
        [](IndexedFormalConcept& first, IndexedFormalConcept& second){ return second.getAttributes().size() < first.getAttributes().size(); });

    std::unique_ptr<std::vector<LatticeItem>> lattice = make_unique<std::vector<LatticeItem>>();
    lattice->resize(concepts.size());

    for (int i = 0; i < concepts.size(); i++) {
        auto& item = (*lattice)[i];
        item.setIndex(concepts[i].getIndex());
    }

    // direct subconcepts of each concept concepts[i]
    std::vector<int> subConcepts;
    subConcepts.resize(concepts.size());
    int subConceptsCount = 0;

    for (int i = 0; i < concepts.size(); i++) {
        subConceptsCount = 0;

        if (i % 1000 == 0) {
            std::cout << "l: " << i << "\n";
        }

        for (int j = i - 1; j >= 0; j--) {
            // j is subconcept of i
            bool isSubset = isSortedSubsetOf(concepts[i].getAttributes(), concepts[j].getAttributes());

            if (isSubset) {
                subConcepts[subConceptsCount] = j;
                subConceptsCount++;
                bool isTransitive = false;

                // if one of the subconcepts has j as a direct subconcept, j is not a direct subconcept of i
                // ignore transitive links
                for (int k = 0; k < subConceptsCount; k++) {
                    int subConcept = subConcepts[k];
                    std::unordered_set<int>& set = (*lattice)[subConcept].getSet();
                    auto it = set.find(j);

                    if (it != set.end()) {
                        isTransitive = true;
                        break;
                    }
                }

                if (!isTransitive) {
                    std::unordered_set<int>& set = (*lattice)[i].getSet();
                    set.insert(j);
                }
            }
        }
    }

    std::vector<std::vector<int>> result;
    result.resize(lattice->size());

    for (LatticeItem & item : *lattice) {
        vector<int> subconcepts(item.getSet().begin(), item.getSet().end());

        for (int i = 0; i < subconcepts.size(); i++) {
            subconcepts[i] = (*lattice)[subconcepts[i]].getIndex();
        }

        result[item.getIndex()] = subconcepts;
    }

    return result;
}

std::vector<std::vector<int>> conceptsCover(
    std::vector<IndexedFormalConcept>& concepts,
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int contextObjectsCount,
    int contextAttributesCount
) {
    //printFormalContext(contextMatrix, cellSize, cellsPerObject, contextObjectsCount, contextAttributesCount);

    std::unique_ptr<std::map<std::vector<int>, int>> conceptsMap = make_unique<std::map<std::vector<int>, int>>();

    for (int i = 0; i < concepts.size(); i++) {
        conceptsMap->insert({ concepts[i].getObjectsCopy(), i });
    }

    std::unique_ptr<std::vector<std::vector<int>>> lattice = make_unique<std::vector<std::vector<int>>>();
    lattice->resize(concepts.size());

    std::vector<int> counts;
    counts.resize(concepts.size(), 0);

    for (int i = 0; i < concepts.size(); i++) {
        for (int j = 0; j < counts.size(); j++) {
            counts[j] = 0;
        }

        if (i % 1000 == 0) {
            std::cout << "l: " << i << "\n";
        }

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
            std::vector<int> inters;
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
            int anotherConceptIndex = conceptsMap->find(inters)->second;
            counts[anotherConceptIndex] = counts[anotherConceptIndex] + 1;

            if (concepts[anotherConceptIndex].getAttributes().size() - conceptAttributesCount == counts[anotherConceptIndex]) {
                // add an edge from concepts[anotherConceptIndex] to concepts[i]
                (*lattice)[anotherConceptIndex].push_back(i);
            }
        }
    }

    return *lattice;
}