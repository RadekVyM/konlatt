#ifndef UTILS_H
#define UTILS_H

#include <vector>
#include <string>
#include <unordered_set>

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

template <typename T>
void printCollection(const T& collection);

long long nowMills();

int maxSizeOfSets(std::vector<std::unordered_set<int>>& sets);
int maxSizeOfVectors(std::vector<std::vector<int>>& vectors);
int sumOfVectorSizes(std::vector<std::vector<int>>& vectors);

inline void trimStart(std::string &s);
inline void trimEnd(std::string &s);
inline void trim(std::string &s);

#endif