import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    coverage: {
      reportsDirectory: "./src/__tests__/coverage",
    },
  },
});
