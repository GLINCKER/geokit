import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
  },
  format: ["cjs", "esm"],
  dts: { entry: { index: "src/index.ts" } },
  clean: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  shims: true,
  external: [
    "@glincker/geo-audit",
    "@glincker/geo-seo",
    "@glincker/geomark",
  ],
});
