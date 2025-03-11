#include "FormalConcept.h"
#include "FormalContext.h"

#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include <stdio.h>
#include <limits.h>
#include <iostream>
#include <sstream>
#include <chrono>

#include "utils.cpp"
#include "burmeister.cpp"
#include "inClose.cpp"
#include "lattice.cpp"

using namespace emscripten;
using namespace std;

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::register_vector<std::string>("StringArray");
    emscripten::register_vector<unsigned int>("UIntArray");
    emscripten::register_vector<int>("IntArray");
    emscripten::register_vector<FormalConcept>("FormalConceptArray");
    emscripten::register_vector<IndexedFormalConcept>("IndexedFormalConceptArray");
    emscripten::register_vector<std::vector<int>>("IntMultiArray");

    emscripten::class_<FormalContext>("FormalContext")
        .constructor()
        .property("cellSize", &FormalContext::getCellSize, &FormalContext::setCellSize)
        .property("cellsPerObject", &FormalContext::getCellsPerObject, &FormalContext::setCellsPerObject)
        .property("objects", &FormalContext::getObjectsCopy, &FormalContext::setObjects)
        .property("attributes", &FormalContext::getAttributesCopy, &FormalContext::setAttributes)
        .property("context", &FormalContext::getContextCopy, &FormalContext::setContext)
        ;

    emscripten::class_<FormalConcept>("FormalConcept")
        .constructor()
        .property("objects", &FormalConcept::getObjectsCopy, &FormalConcept::setObjects)
        .property("attributes", &FormalConcept::getAttributesCopy, &FormalConcept::setAttributes)
        ;

    emscripten::class_<IndexedFormalConcept>("IndexedFormalConcept")
        .constructor()
        .property("objects", &IndexedFormalConcept::getObjectsCopy, &IndexedFormalConcept::setObjects)
        .property("attributes", &IndexedFormalConcept::getAttributesCopy, &IndexedFormalConcept::setAttributes)
        .property("index", &IndexedFormalConcept::getIndex, &IndexedFormalConcept::setIndex)
        ;

    emscripten::function("parseBurmeister", &parseBurmeister);
    emscripten::function("formalContextHasAttribute", &formalContextHasAttribute);
    emscripten::function("inClose", &inClose);
    emscripten::function("conceptsToLattice", &conceptsToLattice);
    emscripten::function("conceptsCover", &conceptsCover);
}