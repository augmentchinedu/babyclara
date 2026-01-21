import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@apollo/client/core/index.js": "@apollo/client/core",
    },
  },
  build: {
    outDir: "../client",
    emptyOutDir: true,
  },
});
