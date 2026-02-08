import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { GeoSeoConfig, JsonLdOutput, JsonLdType, PageEntry } from "../types.js";
import { validateConfig } from "../config.js";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import { generateRobotsTxt } from "../generators/robots-txt.js";
import { generateSitemap } from "../generators/sitemap.js";
import { generateJsonLd } from "../generators/json-ld.js";

interface AstroIntegrationHookParams {
  dir: URL;
}

interface AstroIntegration {
  name: string;
  hooks: {
    "astro:build:done"(params: AstroIntegrationHookParams): Promise<void>;
  };
}

/**
 * Astro integration that generates GEO-SEO files during build.
 * Files are written to the build output directory after Astro finishes.
 *
 * @example
 * ```ts
 * import { geoSeoIntegration } from '@glincker/geo-seo/astro';
 * export default defineConfig({
 *   integrations: [geoSeoIntegration(geoConfig)],
 * });
 * ```
 */
export function geoSeoIntegration(geoConfig: GeoSeoConfig): AstroIntegration {
  const errors = validateConfig(geoConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid GEO-SEO config: ${errors.join(", ")}`);
  }

  return {
    name: "geo-seo",
    hooks: {
      async "astro:build:done"({ dir }: AstroIntegrationHookParams) {
        const outDir = dir instanceof URL ? dir.pathname : String(dir);

        await mkdir(outDir, { recursive: true });

        const llmsTxt = generateLlmsTxt(geoConfig);
        await writeFile(join(outDir, "llms.txt"), llmsTxt, "utf-8");

        const robotsTxt = generateRobotsTxt(geoConfig);
        await writeFile(join(outDir, "robots.txt"), robotsTxt, "utf-8");

        const sitemap = generateSitemap(geoConfig);
        await writeFile(join(outDir, "sitemap.xml"), sitemap, "utf-8");
      },
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
