import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  root: "src/renderer",
  build: {
    outDir: "../../dist/renderer",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/renderer/src"),
      "pretendard-gov": resolve(__dirname, "node_modules/pretendard-gov"),
      "pretendard-jp": resolve(__dirname, "node_modules/pretendard-jp"),
    },
  },
  server: {
    port: 5173,
  },
});
