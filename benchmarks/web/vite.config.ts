import { defineConfig } from "vite";

export default defineConfig({
    server: {
        fs: {
            allow: ["../../.."],
        },
    },
    worker: {
      rollupOptions: {
        output: {
          format: "es",
        }
      },
      format: "es",
    },
    build: {
        target: "es2022",
    },
});