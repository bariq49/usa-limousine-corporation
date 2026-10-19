import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const setupFile = fileURLToPath(new URL("./tests/setup.ts", import.meta.url));
const react = fileURLToPath(new URL("./packages/ui/node_modules/react", import.meta.url));
const reactDom = fileURLToPath(new URL("./packages/ui/node_modules/react-dom", import.meta.url));

export default defineConfig({
  root: repoRoot,
  resolve: {
    alias: {
      react,
      "react-dom": reactDom,
      axios: fileURLToPath(new URL("./apps/admin/node_modules/axios", import.meta.url)),
      "@tanstack/react-query": fileURLToPath(
        new URL("./apps/admin/node_modules/@tanstack/react-query", import.meta.url),
      ),
      "@": fileURLToPath(new URL("./apps/admin", import.meta.url)),
    },
    dedupe: ["react", "react-dom"],
  },
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    pool: "threads",
    setupFiles: setupFile,
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000/api/v1",
    },
    include: ["tests/{ui,admin,customer}/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "tests/e2e/**",
      "tests/results/**",
      "apps/backend/**",
    ],
  },
});
