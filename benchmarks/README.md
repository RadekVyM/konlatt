
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

|                    | Mushroom |
| ------------------ | -------- |
| **Native Clang**   | 1133.62  |
| Native VS 2022     | 1634.48  |
| Native G++         | 1728.24  |
| **Node C++**       | 1281.96  |
| **Node AS**        | 4613.60  |
| Chrome C++         | 1400.08  |
| Chrome C++ Worker  | 1429.64  |
| Chrome AS          | 4167.76  |
| Chrome AS Worker   | 4085.82  |
| Firefox C++        | 1772.50  |
| Firefox C++ Worker | 1716.92  |
| Firefox AS         | 4200.46  |
| Firefox AS Worker  | 4318.34  |

## Apple M1

- Mac mini M1, 2020
- Apple M1
- 16 GB
- macOS Sequoia 15.3.2 (24D81)

|                    | Mushroom |
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
