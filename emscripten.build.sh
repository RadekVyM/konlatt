#!/bin/bash

LIBS_DIR="./libs"

# https://eigen.tuxfamily.org/index.php
EIGEN_VERSION="3.4.0" # You can change this to the desired Eigen version
EIGEN_DOWNLOAD_URL="https://gitlab.com/libeigen/eigen/-/archive/${EIGEN_VERSION}/eigen-${EIGEN_VERSION}.tar.gz"
EIGEN_LIB_DIR="${LIBS_DIR}/Eigen"

echo "============================================="
echo "Setting up the environment"
echo "============================================="

set -e

echo "Checking for Eigen v${EIGEN_VERSION} in ${LIBS_DIR}..."

if [ -d "${EIGEN_LIB_DIR}" ]; then
    echo "Eigen already found in ${LIBS_DIR}. Skipping download and extraction."
else
    echo "Eigen not found. Proceeding with download and extraction."

    # Create the target directory if it doesn't exist
    mkdir -p "${EIGEN_LIB_DIR}"

    # Define temporary file names
    TEMP_ARCHIVE="${LIBS_DIR}/eigen-${EIGEN_VERSION}.tar.gz"

    echo "Downloading Eigen from ${EIGEN_DOWNLOAD_URL}..."
    if ! wget -O "${TEMP_ARCHIVE}" "${EIGEN_DOWNLOAD_URL}"; then
        echo "Error: Failed to download Eigen archive from ${EIGEN_DOWNLOAD_URL}"
        exit 1
    fi
    echo "Download complete."

    echo "Extracting Eigen to ${EIGEN_LIB_DIR}..."
    # The 'eigen-X.Y.Z' directory is inside the tar.gz
    if ! tar -xzf "${TEMP_ARCHIVE}" -C "${LIBS_DIR}" --strip-components=1 "eigen-${EIGEN_VERSION}/Eigen"; then
        echo "Error: Failed to extract Eigen archive."
        rm -f "${TEMP_ARCHIVE}" # Clean up failed download
        exit 1
    fi
    echo "Extraction complete."

    # Clean up the downloaded archive
    rm -f "${TEMP_ARCHIVE}"

    echo "Eigen v${EIGEN_VERSION} successfully downloaded and extracted to ${EIGEN_TARGET_PATH}"
fi

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
    -I libs/ \
    src/cpp/main.cpp \
    -o ./index.js \
    ${OPTIMIZE} \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MALLOC=emmalloc \
    -s MODULARIZE=1 \
    -s EXPORT_ES6=1 \
    -s ASSERTIONS=1 \
    -s EXPORTED_RUNTIME_METHODS=['HEAPU8'] \
    -fwasm-exceptions \
    --emit-tsd ./index.d.ts

    # TODO: -s ASSERTIONS=1 should probably be deleted in the release version

    # Move artifacts
    mv index.{js,wasm} src/cpp/
    mv index.d.ts src/cpp/
)
echo "============================================="
echo "Compiling wasm bindings done"
echo "============================================="