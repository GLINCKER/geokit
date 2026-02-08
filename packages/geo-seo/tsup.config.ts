import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    cli: "src/cli.ts",
    next: "src/adapters/next.ts",
    vite: "src/adapters/vite.ts",
    astro: "src/adapters/astro.ts",
    nuxt: "src/adapters/nuxt.ts",
  },
  format: ["cjs", "esm"],
  dts: {
    entry: {
      index: "src/index.ts",
      next: "src/adapters/next.ts",
      vite: "src/adapters/vite.ts",
      astro: "src/adapters/astro.ts",
      nuxt: "src/adapters/nuxt.ts",
    },
  },
  clean: true,
  treeshake: true,
  splitting: false,
  sourcemap: true,
  shims: true,
  external: ["next", "vite", "astro", "nuxt"],
});
