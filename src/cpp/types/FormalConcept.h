#ifndef FORMAL_CONCEPT_H
#define FORMAL_CONCEPT_H

#include <vector>

// I tried to make these just structs with fields and "pass-by-value-and-move" style constructors
// Overall, it lead to much worse performance of inClose (approx. from 1100ms to 1600ms) – see the failed-cpp-optimizations branch

class FormalConcept {
public:
    FormalConcept() {}

    int getAttribute() const { return attribute; }
    void setAttribute(int value) { attribute = value; }

    std::vector<int>& getObjects() { return objects; }
    std::vector<int> getObjectsCopy() const { return objects; }
    void setObjects(std::vector<int>& value) { objects = value; }

    std::vector<int>& getAttributes() { return attributes; }
    std::vector<int> getAttributesCopy() const { return attributes; }
    void setAttributes(std::vector<int>& value) { attributes = value; }

private:
    std::vector<int> objects;
    std::vector<int> attributes;
    int attribute;
};


class SimpleFormalConcept {
public:
    SimpleFormalConcept() {}

    std::vector<int>& getObjects() { return objects; }
    std::vector<int> getObjectsCopy() const { return objects; }
    void setObjects(std::vector<int>& value) { objects = value; }

    std::vector<int>& getAttributes() { return attributes; }
    std::vector<int> getAttributesCopy() const { return attributes; }
    void setAttributes(std::vector<int>& value) { attributes = value; }

private:
    std::vector<int> objects;
    std::vector<int> attributes;
};

#endif