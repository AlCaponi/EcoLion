import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 15_000,
    hookTimeout: 30_000,
    include: ["src/tests/**/*.test.ts"],
    env: {
      API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:8080",
    },
  },
});
