#ifndef FORMAL_CONCEPT_H
#define FORMAL_CONCEPT_H

#include <vector>

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


class IndexedFormalConcept {
public:
    IndexedFormalConcept() {}

    int getIndex() const { return index; }
    void setIndex(int value) { index = value; }

    std::vector<int>& getObjects() { return objects; }
    std::vector<int> getObjectsCopy() const { return objects; }
    void setObjects(std::vector<int>& value) { objects = value; }

    std::vector<int>& getAttributes() { return attributes; }
    std::vector<int> getAttributesCopy() const { return attributes; }
    void setAttributes(std::vector<int>& value) { attributes = value; }

private:
    std::vector<int> objects;
    std::vector<int> attributes;
    int index;
};

#endif