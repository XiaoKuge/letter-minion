import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // The whole library is client-side (motion + DOM). esbuild strips a banner directive,
  // so the "use client" line is added post-build by scripts/add-directive.mjs.
  external: ["react", "react-dom", "react/jsx-runtime", "motion", "motion/react"],
});
