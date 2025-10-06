
# Benchmarks

| Dataset  | Size     | Concepts |
| -------- | -------- | -------- |
| Mushroom | 8124x126 | 233116   |

`InClose` 50x in a row ⇒ average

the highest levels of compiler optimizations

## Windows

- 11th Gen Intel Core i5-1135G7 @ 2.40GHz (up to 4,20 GHz; 8 MB cache; 4 cores)
- 16 GB
- Windows 11 Home (24H2)

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
| Chrome C++ Worker  |  1174.84 |     27.00 |
| Chrome AS          |  3878.84 |    108.32 |
| Chrome AS Worker   |  3965.92 |     83.73 |
| Chrome JS          |  2446.82 |     33.28 |
| Chrome JS Worker   |  2514.10 |     49.27 |
| Firefox C++        |  1252.76 |     29.29 |
| Firefox C++ Worker |  1218.48 |     25.03 |
| Firefox AS         |  2359.20 |     57.92 |
| Firefox AS Worker  |  2454.66 |     71.07 |
| Firefox JS         |  7829.22 |    145.52 |
| Firefox JS Worker  |  6226.98 |     52.23 |

## Apple M1

- Mac mini M1, 2020
- Apple M1
- 16 GB
- macOS Sequoia 15.3.2 (24D81)

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
| Chrome C++ Worker  |   905.12 |      4.32 |
| Chrome AS          |  3024.68 |      3.55 |
| Chrome AS Worker   |  3027.38 |      4.04 |
| Chrome JS          |  1855.84 |     12.43 |
| Chrome JS Worker   |  1847.64 |     14.27 |
| Firefox C++        |   924.48 |      9.34 |
| Firefox C++ Worker |   929.18 |      4.57 |
| Firefox AS         |  2102.68 |      7.95 |
| Firefox AS Worker  |  2127.88 |     23.58 |
| Firefox JS         |  5138.22 |     28.56 |
| Firefox JS Worker  |  5136.94 |     37.14 |
| Safari C++         |   924.94 |      8.74 |
| Safari C++ Worker  |   923.10 |     10.34 |
| Safari AS          |  1541.74 |      2.97 |
| Safari AS Worker   |  1538.12 |      2.92 |
| Safari JS          |  1315.36 |      7.30 |
| Safari Js Worker   |  1320.26 |      7.39 |
