import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { GeoSeoConfig, JsonLdOutput, JsonLdType, PageEntry } from "../types.js";
import { validateConfig } from "../config.js";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import { generateRobotsTxt } from "../generators/robots-txt.js";
import { generateSitemap } from "../generators/sitemap.js";
import { generateJsonLd } from "../generators/json-ld.js";

interface ViteResolvedConfig {
  root: string;
  build: {
    outDir: string;
  };
}

interface VitePlugin {
  name: string;
  configResolved?(config: ViteResolvedConfig): void;
  closeBundle?(): Promise<void>;
}

/**
 * Vite plugin that generates GEO-SEO files during build.
 * Files are written to the build output directory after bundling.
 *
 * @example
 * ```ts
 * import { geoSeoPlugin } from '@glincker/geo-seo/vite';
 * export default defineConfig({
 *   plugins: [geoSeoPlugin(geoConfig)],
 * });
 * ```
 */
export function geoSeoPlugin(geoConfig: GeoSeoConfig): VitePlugin {
  const errors = validateConfig(geoConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid GEO-SEO config: ${errors.join(", ")}`);
  }

  let resolvedConfig: ViteResolvedConfig | undefined;

  return {
    name: "geo-seo",
    configResolved(config: ViteResolvedConfig) {
      resolvedConfig = config;
    },
    async closeBundle() {
      const root = resolvedConfig?.root ?? process.cwd();
      const outDir = resolve(root, resolvedConfig?.build.outDir ?? "dist");

      await mkdir(outDir, { recursive: true });

      const llmsTxt = generateLlmsTxt(geoConfig);
      await writeFile(join(outDir, "llms.txt"), llmsTxt, "utf-8");

      const robotsTxt = generateRobotsTxt(geoConfig);
      await writeFile(join(outDir, "robots.txt"), robotsTxt, "utf-8");

      const sitemap = generateSitemap(geoConfig);
      await writeFile(join(outDir, "sitemap.xml"), sitemap, "utf-8");
    },
  };
}

/**
 * Generate a JSON-LD script object for a given page.
 * Returns a plain object suitable for `<script type="application/ld+json">`.
 */
export function getJsonLdScript(
  type: JsonLdType,
  config: GeoSeoConfig,
  page?: PageEntry,
): JsonLdOutput {
  return generateJsonLd(type, config, page);
}
