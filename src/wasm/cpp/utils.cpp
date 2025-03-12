#include "utils.h"
#include <stdio.h>
#include <iostream>
#include <chrono>
#include <algorithm> 
#include <cctype>
#include <locale>

using namespace std;

long long nowMills() {
    auto now = std::chrono::system_clock::now();
    return std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
}

bool formalContextHasAttribute(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int object,
    int attribute
) {
    int cell = (object * cellsPerObject) + (attribute / cellSize);
    unsigned int cellValue = contextMatrix[cell];
    unsigned int mask = 1u << (attribute % cellSize);

    return (cellValue & mask) != 0u;
}

bool hasObjectWithAllAttributes(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int objectsCount,
    int attributesCount
) {
    for (int o = 0; o < objectsCount; o++) {
        bool has = true;

        for (int a = 0; a < attributesCount; a++) {
            if (!formalContextHasAttribute(contextMatrix, cellSize, cellsPerObject, o, a)) {
                has = false;
                break;
            }
        }

        if (has) {
            return true;
        }
    }

    return false;
}

bool isSortedSubsetOf(std::vector<int>& subset, std::vector<int>& superset) {
    int i = 0;
    int j = 0;

    while (i < superset.size() && j < subset.size()) {
        if (superset[i] == subset[j]) {
            i++;
            j++;
        }
        else if (superset[i] < subset[j]) {
            i++;
        }
        else {
            return false;
        }
    }

    return j == subset.size();
}

void printFormalContext(
    std::vector<unsigned int>& contextMatrix,
    int cellSize,
    int cellsPerObject,
    int objectsCount,
    int attributesCount
) {
    for (int i = 0; i < objectsCount; i++) {
        for (int j = 0; j < attributesCount; j++) {
            if (formalContextHasAttribute(contextMatrix, cellSize, cellsPerObject, i, j)) {
                std::cout << "X";
            }
            else {
                std::cout << ".";
            }
        }
        std::cout << "\n";
    }
}

void printIndexedFormalConcepts(std::vector<IndexedFormalConcept>& concepts) {
    for (auto & concept : concepts) {
        std::cout << "[";
        for (auto o : concept.getObjects()) {
            std::cout << o << ", ";
        }
        std::cout << "] [";
        for (auto a : concept.getAttributes()) {
            std::cout << a << ", ";
        }
        std::cout << "]\n";
    }
}

inline void trimStart(std::string &s) {
    s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
        return !std::isspace(ch);
    }));
}

inline void trimEnd(std::string &s) {
    s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
        return !std::isspace(ch);
    }).base(), s.end());
}

inline void trim(std::string &s) {
    trimEnd(s);
    trimStart(s);
}