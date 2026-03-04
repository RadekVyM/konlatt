#ifndef FORMAL_CONTEXT_H
#define FORMAL_CONTEXT_H

#include <vector>
#include <string>
#include <cstdint>

class FormalContext {
public:
    FormalContext() {}

    int getCellSize() const { return cellSize; }
    void setCellSize(int value) { cellSize = value; }

    int getCellsPerObject() const { return cellsPerObject; }
    void setCellsPerObject(int value) { cellsPerObject = value; }

    std::vector<std::string>& getObjects() { return objects; }
    std::vector<std::string> getObjectsCopy() const { return objects; }
    void setObjects(std::vector<std::string>& value) { objects = value; }

    std::vector<std::string>& getAttributes() { return attributes; }
    std::vector<std::string> getAttributesCopy() const { return attributes; }
    void setAttributes(std::vector<std::string>& value) { attributes = value; }

    std::vector<uint64_t>& getContext() { return context; }
    std::vector<uint64_t> getContextCopy() const { return context; }
    void setContext(std::vector<uint64_t>& value) { context = value; }

private:
    int cellSize;
    int cellsPerObject;
    std::vector<std::string> objects;
    std::vector<std::string> attributes;
    std::vector<uint64_t> context;
};

#endif