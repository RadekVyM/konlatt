// https://hub.docker.com/_/gcc/tags

// GCC Unix:
// docker run --rm -it -v "${PWD}:/usr/src/myapp" -w /usr/src/myapp gcc:latest g++ -O3 -o ./benchmarks/native/main_gcc -static ./benchmarks/native/main.cpp

// GCC Windows:
// docker run --rm -it -v "${PWD}:/usr/src/myapp" -w /usr/src/myapp abeimler/simple-cppbuilder:ci-x64-mingw-w64 x86_64-w64-mingw32-g++ -O3 -o ./benchmarks/native/main_gcc.exe -static ./benchmarks/native/main.cpp

// docker run --rm abeimler/simple-cppbuilder:ci-x64-mingw-w64 g++ -v

// VS Windows:
// cl /O2 /GL /fp:fast /favor:blend /Oi /EHsc /Fe:main_vs.exe ./main.cpp

// Clang Windows:
// docker build -f dockerfile.wins -t cpp-windows-clang .
// docker run --rm -v "${PWD}:/app" cpp-windows-clang

// docker run --rm cpp-windows-clang clang --version
// docker run --rm cpp-windows-clang llvm-config --version

// Clang macOS:
// clang++ -std=gnu++17 -O3 ./benchmarks/native/main.cpp -o ./benchmarks/native/mainapp

#include "../../src/cpp/types/FormalConcept.h"
#include "../../src/cpp/types/FormalContext.h"
#include "../../src/cpp/types/TimedResult.h"

#include "../../src/cpp/utils.cpp"
#include "../../src/cpp/burmeister.cpp"
#include "../../src/cpp/inClose.cpp"

#include <stdio.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <numeric>
#include <cmath>
#include <algorithm>

struct Stats {
    double average;
    double stdDeviation;
};

std::string readFileToString(const std::string& filePath) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        return "";
    }

    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

Stats generateStats(const std::vector<double>& times) {
    double timesSum = std::accumulate(times.begin(), times.end(), 0.0);
    double average = timesSum / times.size();

    double deviationsSum = 0.0;
    for (double current : times) {
        deviationsSum += std::pow(current - average, 2);
    }

    double variance = deviationsSum / times.size();
    double stdDeviation = std::sqrt(variance);

    return {average, stdDeviation};
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

    std::vector<double> times;
    int runsCount = 50;

    for (int i = 0; i < runsCount; i++) {
        TimedResult<std::vector<FormalConcept>> result;

        inClose(
            result,
            context.getContext(),
            context.getCellSize(),
            context.getCellsPerObject(),
            context.getObjects().size(),
            context.getAttributes().size());

        times.push_back(result.time);
        std::cerr << "[" << i << "] Time: " << result.time << "ms" << std::endl;
    }

    auto stats = generateStats(times);

    std::cerr << "Average time: " << stats.average << "ms" << std::endl;
    std::cerr << "Standard deviation: " << stats.stdDeviation << "ms" << std::endl;

    return 0;
}