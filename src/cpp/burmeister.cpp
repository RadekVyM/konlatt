#include "types/FormalContext.h"
#include "utils.h"

#include <stdio.h>
#include <iostream>
#include <sstream>
#include <memory>
#include <string>
#include <vector>
#include <cmath>
#include <cstdint>

#define CELL_SIZE 52 // Size of max safe JS integer

FormalContext parseBurmeister(std::string fileContent) {
    // TODO: Produce exceptions when issues with the file format are encountered
    FormalContext context;
    std::stringstream fileContentStream(fileContent);

    std::string bLine;
    std::getline(fileContentStream, bLine);

    std::string nameLine;
    std::getline(fileContentStream, nameLine);

    std::string objectsCountLine;
    std::getline(fileContentStream, objectsCountLine);

    std::string attributesCountLine;
    std::getline(fileContentStream, attributesCountLine);

    std::string emptyLine;
    std::getline(fileContentStream, emptyLine);

    int objectsCount = stoi(objectsCountLine);
    int attributesCount = stoi(attributesCountLine);

    std::vector<std::string> atributes;
    std::vector<std::string> objects;
    std::vector<uint64_t> contextMatrix;

    for (int i = 0; i < objectsCount; i++) {
        std::string line;
        std::getline(fileContentStream, line);
        trim(line);

        objects.push_back(line);
    }

    for (int i = 0; i < attributesCount; i++) {
        std::string line;
        std::getline(fileContentStream, line);
        trim(line);

        atributes.push_back(line);
    }

    for (int i = 0; i < objectsCount; i++) {
        std::string line;
        std::getline(fileContentStream, line);

        int offset = 0;
        uint64_t value = 0u;
        uint64_t one = 1;

        for (char & character : line) {
            character = tolower(character);

            if (character == '.') {
                offset++;
            }
            else if (character == 'x') {
                value = value | (one << offset);
                offset++;
            }
            else {
                // error
            }

            if (offset == CELL_SIZE) {
                contextMatrix.push_back(value);
                value = 0u;
                offset = 0;
            }
        }
        
        contextMatrix.push_back(value);
    }

    context.setObjects(objects);
    context.setAttributes(atributes);
    context.setCellsPerObject((int)ceil(atributes.size() / (double)CELL_SIZE));
    context.setCellSize(CELL_SIZE);
    context.setContext(contextMatrix);

    return context;
}