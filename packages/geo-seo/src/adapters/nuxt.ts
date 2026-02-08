import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { GeoSeoConfig, JsonLdOutput, JsonLdType, PageEntry } from "../types.js";
import { validateConfig } from "../config.js";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import { generateRobotsTxt } from "../generators/robots-txt.js";
import { generateSitemap } from "../generators/sitemap.js";
import { generateJsonLd } from "../generators/json-ld.js";

interface NuxtHooks {
  hook(name: string, fn: (...args: unknown[]) => Promise<void> | void): void;
}

interface NitroConfig {
  output?: {
    publicDir?: string;
  };
}

interface NuxtLike {
  hook: NuxtHooks["hook"];
  options: {
    rootDir: string;
    nitro?: NitroConfig;
  };
}

type NuxtModuleFunction = (nuxt: NuxtLike) => void;

/**
 * Nuxt module that generates GEO-SEO files during build.
 * Files are written to the Nitro public output directory.
 *
 * @example
 * ```ts
 * // nuxt.config.ts
 * import { geoSeoModule } from '@glincker/geo-seo/nuxt';
 * import { geoConfig } from './geo.config';
 *
 * export default defineNuxtConfig({
 *   modules: [geoSeoModule(geoConfig)],
 * });
 * ```
 */
export function geoSeoModule(geoConfig: GeoSeoConfig): NuxtModuleFunction {
  const errors = validateConfig(geoConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid GEO-SEO config: ${errors.join(", ")}`);
  }

  return function geoSeoNuxtModule(nuxt: NuxtLike) {
    nuxt.hook("nitro:build:public-assets", async (...args: unknown[]) => {
      const nitro = args[0] as { options?: { output?: { publicDir?: string } } } | undefined;
      const outDir = nitro?.options?.output?.publicDir
        ?? resolve(nuxt.options.rootDir, ".output/public");

      await mkdir(outDir, { recursive: true });

      const llmsTxt = generateLlmsTxt(geoConfig);
      await writeFile(join(outDir, "llms.txt"), llmsTxt, "utf-8");

      const robotsTxt = generateRobotsTxt(geoConfig);
      await writeFile(join(outDir, "robots.txt"), robotsTxt, "utf-8");

      const sitemap = generateSitemap(geoConfig);
      await writeFile(join(outDir, "sitemap.xml"), sitemap, "utf-8");
    });
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
