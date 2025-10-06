
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

- LLVM 18.1.3, Ubuntu clang version 18.1.3 (1ubuntu1)
- gcc version 11.3.0 (Ubuntu 11.3.0-1ubuntu1~22.04)
- Visual Studio 2022 Developer Command Prompt v17.14.16
- Google Chrome Version 141.0.7390.55
- Firefox 143.0.4 (64 bit)
- Node.js v22.13.1

|                    | Average  | Std. dev. |
| ------------------ | -------- | --------- |
| **Native Clang**   | 1080.68  | 17.33     |
| Native VS 2022     | 1562.88  | 38.25     |
| Native G++         | 1657.80  | 29.43     |
| **Node C++**       | 1044.26  | 25.55     |
| **Node AS**        | 4586.70  | 94.88     |
| **Node JS**        | 10138.06 | 171.95    |
| Chrome C++         | 1164.12  | 27.94     |
| Chrome C++ Worker  | 1174.84  | 27.00     |
| Chrome AS          | 3878.84  | 108.32    |
| Chrome AS Worker   | 3965.92  | 83.73     |
| Chrome JS          | 2446.82  | 33.28     |
| Chrome JS Worker   | 2514.10  | 49.27     |
| Firefox C++        | 1252.76  | 29.29     |
| Firefox C++ Worker | 1218.48  | 25.03     |
| Firefox AS         | 2359.20  | 57.92     |
| Firefox AS Worker  | 2454.66  | 71.07     |
| Firefox JS         | 7829.22  | 145.52    |
| Firefox JS Worker  | 6226.98  | 52.23     |

## Apple M1

- Mac mini M1, 2020
- Apple M1
- 16 GB
- macOS Sequoia 15.3.2 (24D81)

|                    | Average  |
| ------------------ | -------- |
| **Native Clang**   |   757.66 |
| **Node C++**       |  1027.08 |
| **Node AS**        |  3101.30 |
| Chrome C++         |  1119.62 |
| Chrome C++ Worker  |  1123.08 |
| Chrome AS          |  3101.08 |
| Chrome AS Worker   |  3102.80 |
| Firefox C++        |  1346.82 |
| Firefox C++ Worker |  1362.32 |
| Firefox AS         |  6484.16 |
| Firefox AS Worker  |  6529.52 |
| Safari C++         |  1006.14 |
| Safari C++ Worker  |   996.36 |
| Safari AS          |  1699.02 |
| Safari AS Worker   |  1703.82 |
