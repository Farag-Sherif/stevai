import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd()),
      },
    },
    define: {
      "process.env": JSON.stringify(env),
      global: "globalThis",
    },
    envPrefix: ["VITE_", "NEXT_PUBLIC_", "API_"],
    server: {
      port: 3002,
    },
    preview: {
      port: 3002,
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            swiper: ["swiper"],
            photoswipe: ["photoswipe"],
            bootstrap: ["bootstrap"],
            query: ["@tanstack/react-query"],
          },
        },
      },
    },
  };
});
