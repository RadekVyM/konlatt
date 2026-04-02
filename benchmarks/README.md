# Benchmarks

This file provides benchmarking details for various implementations of the `InClose` algorithm. This repository includes three implementations:

- C++ – `/src/cpp/inClose.cpp`
- AssemblyScript – `/benchmarks/as/assembly/concepts/inClose.ts`
- TypeScript – `/benchmarks/js/inClose.ts`

All implementations use the highest level of compiler optimizations. Each benchmark runs 50 consecutive iterations per platform to calculate the average execution time.

## How to run the benchmarks

First, install the project dependencies:

```bash
npm install
```

### Native C++

Compile the C++ code using Clang:
- Windows (via Docker):
    ```bash
    docker build -f ./benchmarks/native/dockerfile.wins -t cpp-windows-clang ./benchmarks/native

    docker run --rm -v "${PWD}:/app" cpp-windows-clang
    ```
- macOS (via Xcode tools):
    ```bash
    clang++ -std=gnu++17 -O3 ./benchmarks/native/main.cpp -o ./benchmarks/native/main_clang -static-libgcc -static-libstdc++ -static
    ```
Run the compiled binary:
```bash
# Windows
./benchmarks/native/main_clang.exe ./datasets/mushroomep.cxt
# macOS
./benchmarks/native/main_clang ./datasets/mushroomep.cxt
```

### Compile C++ into WebAssembly

Use Docker to compile the C++ code into WebAssembly (WASM) with the Emscripten SDK. Choose the appropriate command for your operating system.

- Windows:
    ```bash
    npm run build:emscripten-wins
    ```
- Unix-like (Linux/macOS):
    ```bash
    npm run build:emscripten-unix
    ```
- ARM-based Unix-like (Apple Silicon):
    ```bash
    npm run build:emscripten-arm-unix
    ```

### Compile AssemblyScript into WebAssembly

```bash
cd ./benchmarks/as
npm install
npm run build
cd ../..
```

### Node.js

- C++ implementation:
    ```bash
    npx vite-node@5.3.0 ./benchmarks/node/cpp.ts
    ```
- AssemblyScript implementation:
    ```bash
    npx vite-node@5.3.0 ./benchmarks/node/as.ts
    ```
- TypeScript implementation:
    ```bash
    npx vite-node@5.3.0 ./benchmarks/node/js.ts
    ```

### Web browser

1. Navigate to the `./benchmarks/web` directory:
    ```bash
    cd ./benchmarks/web
    ```
2. Build and launch the application:
    ```bash
    npm install
    npm run build
    npm run preview
    ```
3. Open the application in your preferred browser.
4. Click the button and wait for the results.

## Benchmark results

| Dataset  | Size     | Concepts |
| -------- | -------- | -------- |
| Mushroom | 8124x126 | 233116   |

### Windows

System:

- 11th Gen Intel Core i5-1135G7 @ 2.40GHz (up to 4,20 GHz; 8 MB cache; 4 cores)
- 16 GB
- Windows 11 Home (24H2)

Tooling versions:

- Ubuntu clang version 18.1.3 (1ubuntu1)
- gcc version 11.3.0 (Ubuntu 11.3.0-1ubuntu1~22.04)
- Visual Studio 2022 Developer Command Prompt v17.14.16
- Google Chrome Version 141.0.7390.55 (Official Build)
- Firefox 143.0.4 (64 bit)
- Node.js v22.13.1
- emsdk 4.0.6

|                    | Average  | Std. dev. |
| ------------------ | -------- | --------- |
| **Native Clang**   |  1080.68 |     17.33 |
| Native VS 2022     |  1562.88 |     38.25 |
| Native G++         |  1657.80 |     29.43 |
| **Node C++**       |  1044.26 |     25.55 |
| **Node AS**        |  4586.70 |     94.88 |
| **Node JS**        | 10138.06 |    171.95 |
| Chrome C++         |  1164.12 |     27.94 |
| Chrome AS          |  3878.84 |    108.32 |
| **Chrome JS**      |  2446.82 |     33.28 |
| Firefox C++        |  1252.76 |     29.29 |
| Firefox AS         |  2359.20 |     57.92 |
| Firefox JS         |  7829.22 |    145.52 |
| Chrome C++ Worker  |  1174.84 |     27.00 |
| Chrome AS Worker   |  3965.92 |     83.73 |
| Chrome JS Worker   |  2514.10 |     49.27 |
| Firefox C++ Worker |  1218.48 |     25.03 |
| Firefox AS Worker  |  2454.66 |     71.07 |
| Firefox JS Worker  |  6226.98 |     52.23 |

### Apple M1

System:

- Mac mini M1, 2020
- Apple M1
- 16 GB
- macOS Sequoia 15.3.2 (24D81)

Tooling versions:

- Apple clang version 17.0.0 (clang-1700.0.13.5)
- Google Chrome Version 140.0.7339.133 (Official Build) (arm64)
- Firefox 143.0.4 (aarch64)
- Safari Version 18.5 (20621.2.5.11.8)
- Node.js v22.10.0
- emsdk 4.0.6

|                    | Average  | Std. dev. |
| ------------------ | -------- | --------- |
| **Native Clang**   |   727.70 |      5.14 |
| **Node C++**       |   876.92 |      4.94 |
| **Node AS**        |  3626.58 |      7.42 |
| **Node JS**        |  8729.52 |     61.94 |
| Chrome C++         |   904.48 |      5.37 |
| Chrome AS          |  3024.68 |      3.55 |
| **Chrome JS**      |  1855.84 |     12.43 |
| Firefox C++        |   924.48 |      9.34 |
| Firefox AS         |  2102.68 |      7.95 |
| Firefox JS         |  5138.22 |     28.56 |
| Safari C++         |   924.94 |      8.74 |
| Safari AS          |  1541.74 |      2.97 |
| Safari JS          |  1315.36 |      7.30 |
| Chrome C++ Worker  |   905.12 |      4.32 |
| Chrome AS Worker   |  3027.38 |      4.04 |
| Chrome JS Worker   |  1847.64 |     14.27 |
| Firefox C++ Worker |   929.18 |      4.57 |
| Firefox AS Worker  |  2127.88 |     23.58 |
| Firefox JS Worker  |  5136.94 |     37.14 |
| Safari C++ Worker  |   923.10 |     10.34 |
| Safari AS Worker   |  1538.12 |      2.92 |
| Safari JS Worker   |  1320.26 |      7.39 |
