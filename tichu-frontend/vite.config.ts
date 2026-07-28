import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const apiProxy = {
  target: process.env.TICHU_API_PROXY_TARGET || "http://localhost:8080",
  changeOrigin: true,
  rewrite: (requestPath: string) => requestPath.replace(/^\/api/, ""),
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      "/api": apiProxy,
    },
  },
  preview: {
    proxy: {
      "/api": apiProxy,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
