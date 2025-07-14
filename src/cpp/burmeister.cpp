#include "types/FormalContext.h"
#include "utils.h"

#include <stdio.h>
#include <iostream>
#include <sstream>
#include <memory>
#include <string>
#include <vector>
#include <cmath>

using namespace std;

FormalContext parseBurmeister(std::string fileContent) {
    // TODO: Produce exceptions when issues with the file format are encountered
    std::unique_ptr<FormalContext> context = std::make_unique<FormalContext>();
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

    int cellSize = sizeof(unsigned int) * 8;

    std::vector<std::string> atributes;
    std::vector<std::string> objects;
    std::vector<unsigned int> contextMatrix;

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
        unsigned int value = 0u;

        for (char & character : line) {
            character = tolower(character);

            if (character == '.') {
                offset++;
            }
            else if (character == 'x') {
                value = value | (1u << offset);
                offset++;
            }
            else {
                // error
            }

            if (offset == cellSize) {
                contextMatrix.push_back(value);
                value = 0u;
                offset = 0;
            }
        }
        
        contextMatrix.push_back(value);
    }

    context->setObjects(objects);
    context->setAttributes(atributes);
    context->setCellsPerObject((int)ceil(atributes.size() / (double)cellSize));
    context->setCellSize(cellSize);
    context->setContext(contextMatrix);

    return *context;
}