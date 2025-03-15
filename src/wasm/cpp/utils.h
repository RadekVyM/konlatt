#ifndef UTILS_H
#define UTILS_H

#include <vector>
#include <string>

bool formalContextHasAttribute(
    std::vector<unsigned int> &contextMatrix,
    int cellSize,
    int cellsPerObject,
    int object,
    int attribute);

bool hasObjectWithAllAttributes(
    std::vector<unsigned int> &contextMatrix,
    int cellSize,
    int cellsPerObject,
    int objectsCount,
    int attributesCount);

bool isSortedSubsetOf(std::vector<int>& subset, std::vector<int>& superset);

void printFormalContext(
    std::vector<unsigned int> &contextMatrix,
    int cellSize,
    int cellsPerObject,
    int objectsCount,
    int attributesCount);

long long nowMills();

inline void trimStart(std::string &s);
inline void trimEnd(std::string &s);
inline void trim(std::string &s);

#endif