#ifndef FORMAL_CONCEPT_H
#define FORMAL_CONCEPT_H

#include <vector>

struct FormalConcept {
    FormalConcept(std::vector<int> objects, std::vector<int> attributes, int attribute)
        : objects(std::move(objects)), attributes(std::move(attributes)), attribute(attribute) {}

    std::vector<int> objects;
    std::vector<int> attributes;
    int attribute;
};

struct SimpleFormalConcept {
    SimpleFormalConcept(std::vector<int> objects, std::vector<int> attributes)
        : objects(std::move(objects)), attributes(std::move(attributes)) {}

    std::vector<int> objects;
    std::vector<int> attributes;
};

#endif