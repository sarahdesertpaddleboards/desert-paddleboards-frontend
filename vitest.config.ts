import { defineConfig } from "vitest/config";

// Deliberately does NOT extend vite.config.ts — these are plain Node unit
// tests (the /go/* short-link resolver), so there's no reason to spin up the
// React/Tailwind/SSG plugin chain for them.
export default defineConfig({
  test: {
    environment: "node",
    include: ["config/**/*.test.{js,ts}", "functions/**/*.test.{js,ts}"],
  },
});
