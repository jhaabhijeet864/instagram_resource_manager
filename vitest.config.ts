// Vitest configuration for the DevResource backend test suite.
// Run with: npm test
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      include: ["lib/**", "app/api/**", "plugins/**", "scripts/**"],
      reporter: ["text", "html"],
    },
  },
});
