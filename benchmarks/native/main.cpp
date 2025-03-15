// https://hub.docker.com/_/gcc/tags
// docker run --rm -it -v "${PWD}:/usr/src/myapp" -w /usr/src/myapp gcc:latest g++ -o ./benchmarks/native/myapp ./benchmarks/native/main.cpp
// docker run --rm -it -v "${PWD}:/usr/src/myapp" -w /usr/src/myapp abeimler/simple-cppbuilder:ci-x64-mingw-w64 x86_64-w64-mingw32-g++ -o ./benchmarks/native/myapp.exe ./benchmarks/native/main.cpp

#include "../../src/wasm/cpp/FormalConcept.h"
#include "../../src/wasm/cpp/FormalContext.h"

#include "../../src/wasm/cpp/utils.cpp"
#include "../../src/wasm/cpp/burmeister.cpp"
#include "../../src/wasm/cpp/inClose.cpp"

#include <iostream>

using namespace std;

int main() {
    std::cout << "Hello from Windows!" << std::endl;
    return 0;
}