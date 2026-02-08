import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { GeoSeoConfig, JsonLdOutput, JsonLdType, PageEntry } from "../types.js";
import { validateConfig } from "../config.js";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import { generateRobotsTxt } from "../generators/robots-txt.js";
import { generateSitemap } from "../generators/sitemap.js";
import { generateJsonLd } from "../generators/json-ld.js";

/**
 * Wrap a Next.js config with GEO-SEO file generation.
 * Files are written to `public/` during build via a webpack plugin.
 *
 * @example
 * ```ts
 * import { withGeoSEO } from '@glincker/geo-seo/next';
 * export default withGeoSEO(geoConfig)({ reactStrictMode: true });
 * ```
 */
export function withGeoSEO(geoConfig: GeoSeoConfig) {
  const errors = validateConfig(geoConfig);
  if (errors.length > 0) {
    throw new Error(`Invalid GEO-SEO config: ${errors.join(", ")}`);
  }

  return function wrapNextConfig<T extends Record<string, unknown>>(nextConfig: T): T {
    const existingWebpack = nextConfig.webpack as
      | ((config: Record<string, unknown>, options: Record<string, unknown>) => Record<string, unknown>)
      | undefined;

    return {
      ...nextConfig,
      webpack(config: Record<string, unknown>, options: Record<string, unknown>) {
        const isServer = (options as { isServer?: boolean }).isServer ?? false;

        // Only run on server build to avoid duplicate writes
        if (isServer) {
          const outDir = resolve(
            (nextConfig.dir as string | undefined) ?? process.cwd(),
            "public",
          );

          // Apply plugin — runs after compilation
          const plugins = (config.plugins ?? []) as Array<{ apply(compiler: unknown): void }>;
          plugins.push({
            apply(compiler: unknown) {
              const comp = compiler as {
                hooks: {
                  afterEmit: {
                    tapPromise(name: string, fn: () => Promise<void>): void;
                  };
                };
              };
              comp.hooks.afterEmit.tapPromise("GeoSEOPlugin", async () => {
                await mkdir(outDir, { recursive: true });

                const llmsTxt = generateLlmsTxt(geoConfig);
                await writeFile(join(outDir, "llms.txt"), llmsTxt, "utf-8");

                const robotsTxt = generateRobotsTxt(geoConfig);
                await writeFile(join(outDir, "robots.txt"), robotsTxt, "utf-8");

                const sitemap = generateSitemap(geoConfig);
                await writeFile(join(outDir, "sitemap.xml"), sitemap, "utf-8");
              });
            },
          });
          config.plugins = plugins;
        }

        // Chain existing webpack config if present
        if (existingWebpack) {
          return existingWebpack(config, options);
        }
        return config;
      },
    };
  };
}

/**
 * Generate a JSON-LD script object for a given page.
 * Returns a plain object suitable for `<script type="application/ld+json">`.
 * No React dependency needed — works with any templating.
 *
 * @example
 * ```ts
 * const jsonLd = getJsonLdScript('WebPage', geoConfig, page);
 * // <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
 * ```
 */
export function getJsonLdScript(
  type: JsonLdType,
  config: GeoSeoConfig,
  page?: PageEntry,
): JsonLdOutput {
  return generateJsonLd(type, config, page);
}
