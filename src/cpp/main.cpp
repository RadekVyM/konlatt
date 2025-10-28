#include "types/FormalConcept.h"
#include "types/FormalContext.h"
#include "types/TimedResult.h"
#include "types/OnProgressCallback.h"

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
#include "conceptsCover.cpp"
#include "layout/utils.cpp"
#include "layout/layers.cpp"
#include "layout/layered/dummies.cpp"
#include "layout/layered/simplePlacement.cpp"
#include "layout/layered/bkPlacement.cpp"
#include "layout/layered/ellipsePlacement.cpp"
#include "layout/layered/layeredLayout.cpp"
#include "layout/freeseLayout.cpp"
#include "layout/reDrawLayout.cpp"
#include "layout/layouts.cpp"

using namespace emscripten;

// The result objects are not returned from the functions,
// but are passed into them through parameters from JavaScript.
// This way, a few copies of (often large) vectors can be avoided.

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::register_vector<std::string>("StringArray");
    emscripten::register_vector<unsigned int>("UIntArray");
    emscripten::register_vector<int>("IntArray");
    emscripten::register_vector<float>("FloatArray");
    emscripten::register_vector<FormalConcept>("FormalConceptArray");
    emscripten::register_vector<SimpleFormalConcept>("SimpleFormalConceptArray");
    emscripten::register_vector<std::vector<int>>("IntMultiArray");

    emscripten::class_<FormalContext>("FormalContext")
        .constructor()
        .property("cellSize", &FormalContext::getCellSize, &FormalContext::setCellSize)
        .property("cellsPerObject", &FormalContext::getCellsPerObject, &FormalContext::setCellsPerObject)
        .property("objects", &FormalContext::getObjectsCopy, &FormalContext::setObjects)
        .property("attributes", &FormalContext::getAttributesCopy, &FormalContext::setAttributes)
        .property("context", &FormalContext::getContextCopy, &FormalContext::setContext);

    emscripten::class_<FormalConcept>("FormalConcept")
        .constructor()
        .property("objects", &FormalConcept::getObjectsCopy, &FormalConcept::setObjects)
        .property("attributes", &FormalConcept::getAttributesCopy, &FormalConcept::setAttributes);

    emscripten::class_<SimpleFormalConcept>("SimpleFormalConcept")
        .constructor()
        .property("objects", &SimpleFormalConcept::getObjectsCopy, &SimpleFormalConcept::setObjects)
        .property("attributes", &SimpleFormalConcept::getAttributesCopy, &SimpleFormalConcept::setAttributes);

    emscripten::class_<TimedResult<std::vector<FormalConcept>>>("FormalConceptsTimedResult")
        .constructor<>()
        .property("value", &TimedResult<std::vector<FormalConcept>>::value)
        .property("time", &TimedResult<std::vector<FormalConcept>>::time);

    emscripten::class_<TimedResult<std::vector<std::vector<int>>>>("IntMultiArrayTimedResult")
        .constructor<>()
        .property("value", &TimedResult<std::vector<std::vector<int>>>::value)
        .property("time", &TimedResult<std::vector<std::vector<int>>>::time);

    emscripten::class_<TimedResult<std::vector<int>>>("IntArrayTimedResult")
        .constructor<>()
        .property("value", &TimedResult<std::vector<int>>::value)
        .property("time", &TimedResult<std::vector<int>>::time);

    emscripten::class_<TimedResult<std::vector<float>>>("FloatArrayTimedResult")
        .constructor<>()
        .property("value", &TimedResult<std::vector<float>>::value)
        .property("time", &TimedResult<std::vector<float>>::time);

    emscripten::function("parseBurmeister", &parseBurmeister);
    emscripten::function("formalContextHasAttribute", &formalContextHasAttribute);
    emscripten::function("inClose", &inClose);
    emscripten::function("conceptsCover", &conceptsCover);
    emscripten::function("computeLayeredLayout", &computeLayeredLayoutJs);
    emscripten::function("computeFreeseLayout", &computeFreeseLayoutJs);
    emscripten::function("computeReDrawLayout", &computeReDrawLayoutJs);

    emscripten::register_type<OnProgressCallback>("((progress: number) => void) | undefined");
}