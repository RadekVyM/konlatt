// https://hub.docker.com/_/gcc/tags
// docker run --rm -it -v "${PWD}:/usr/src/myapp" -w /usr/src/myapp gcc:latest g++ -O3 -o ./benchmarks/native/bench -static ./benchmarks/native/main.cpp
// docker run --rm -it -v "${PWD}:/usr/src/myapp" -w /usr/src/myapp abeimler/simple-cppbuilder:ci-x64-mingw-w64 x86_64-w64-mingw32-g++ -O3 -o ./benchmarks/native/bench.exe -static ./benchmarks/native/main.cpp
// cl /O2 /GL /fp:fast /favor:blend /Oi /EHsc ./main.cpp

// docker build -f dockerfile.wins -t cpp-windows-clang .
// docker run --rm -v "./:/app" cpp-windows-clang

// clang++ -std=gnu++17 -O3 ./benchmarks/native/main.cpp -o ./benchmarks/native/mainapp

#include "../../src/wasm/cpp/FormalConcept.h"
#include "../../src/wasm/cpp/FormalContext.h"

#include "../../src/wasm/cpp/utils.cpp"
#include "../../src/wasm/cpp/burmeister.cpp"
#include "../../src/wasm/cpp/inClose.cpp"

#include <stdio.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

using namespace std;

std::string readFileToString(const std::string& filePath) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        return "";
    }

    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <file_path>" << std::endl;
        return 1;
    }

    std::string filePath = argv[1];
    std::string fileContent = readFileToString(filePath);

    if (fileContent.empty()) {
        std::cerr << "Error reading file or file not found." << std::endl;
        return 1;
    }

    FormalContext context = parseBurmeister(fileContent);

    int sum = 0;
    int runsCount = 50;

    for (int i = 0; i < runsCount; i++) {
        auto result = inClose(
            context.getContext(),
            context.getCellSize(),
            context.getCellsPerObject(),
            context.getObjects().size(),
            context.getAttributes().size());
    
        sum += result.time;
        std::cerr << "[" << i << "] Time: " << result.time << "ms" << std::endl;
    }

    std::cerr << "Average time: " << (double)sum / runsCount << "ms" << std::endl;

    return 0;
}