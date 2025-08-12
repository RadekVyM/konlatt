# konlatt

## Building and Running the Application

To run this project, you need to first install the dependencies, then use Docker to compile the C++ code with Emscripten, build the main application, and finally start the preview server.

All commands should be run from the project's root directory where `package.json` is located.

### 1. Install Dependencies

First, install the project dependencies:

```bash
npm install
```

### 2. Compile C++ to WASM with Docker

Next, use Docker to compile the C++ code into WebAssembly (WASM) with the Emscripten SDK. Choose the appropriate command for your operating system.

* **Windows:**
    ```bash
    npm run build:emscripten-wins
    ```
* **Unix-like (Linux/macOS):**
    ```bash
    npm run build:emscripten-unix
    ```
* **ARM-based Unix-like (Apple Silicon):**
    ```bash
    npm run build:emscripten-arm-unix
    ```

### 3. Build the Application

After the WASM compilation is complete, build the main application:

```bash
npm run build
```

### 4. Run the Application

Once everything is built, you can preview the application:

```bash
npm run preview
```