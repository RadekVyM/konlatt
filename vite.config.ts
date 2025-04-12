import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const ReactCompilerConfig = { };

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler", ReactCompilerConfig],
        ],
      },
    }),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,ttf,wasm}"]
      },
      manifest: {
        name: "konlatt",
        short_name: "konlatt",
        description: "Visualize and analyze concept lattices online. Import data in multiple formats, explore relationships, and export lattice diagrams easily.",
        background_color: "#f8fafc",
        theme_color: "#f8fafc",
        icons: [
          {
            src: "/images/logo_light.svg",
            sizes: "any",
            type: "image/svg+xml",
          },
        ]
      },
    }),
  ],
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
})
