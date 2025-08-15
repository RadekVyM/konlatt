#ifndef FORMAL_CONTEXT_H
#define FORMAL_CONTEXT_H

#include <vector>
#include <string>

struct FormalContext {
    FormalContext(
        int cellSize,
        int cellsPerObject,
        std::vector<std::string> objects,
        std::vector<std::string> attributes,
        std::vector<unsigned int> context) :
        cellSize(cellSize),
        cellsPerObject(cellsPerObject),
        objects(std::move(objects)),
        attributes(std::move(attributes)),
        context(std::move(context)) {}

    int cellSize;
    int cellsPerObject;
    std::vector<std::string> objects;
    std::vector<std::string> attributes;
    std::vector<unsigned int> context;
};

#endif