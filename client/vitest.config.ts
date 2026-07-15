import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // Cast: @vitejs/plugin-react is typed against a different bundled Vite copy
  // than vitest/config, producing a harmless plugin-type skew.
  plugins: [react(), tsconfigPaths()] as never,
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
