#!/bin/bash

echo "============================================="
echo "Setting up the environment"
echo "============================================="

set -e

# npm install -g npm@latest
npm install -g typescript --no-update-notifier

# https://emscripten.org/docs/tools_reference/emcc.html#emcc-compiler-optimization-options
export OPTIMIZE="-O3"
export LDFLAGS="${OPTIMIZE}"
export CFLAGS="${OPTIMIZE}"
export CXXFLAGS="${OPTIMIZE}"

echo "============================================="
echo "Compiling wasm bindings"
echo "============================================="
(
    # Compile C/C++ code
    emcc \
    -lembind \
    src/wasm/cpp/main.cpp \
    -o ./index.js \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MALLOC=emmalloc \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s ASSERTIONS=1 \
    -fexceptions \
    --emit-tsd ./index.d.ts

    # TODO: -s ASSERTIONS=1 should probably be deleted in the release version

    # Move artifacts
    mv index.{js,wasm} src/wasm/cpp/
    mv index.d.ts src/wasm/cpp/
)
echo "============================================="
echo "Compiling wasm bindings done"
echo "============================================="