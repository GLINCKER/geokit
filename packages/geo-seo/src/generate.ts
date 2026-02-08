import { writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { GeoSeoConfig, GenerateResult, GeneratedFile } from "./types.js";
import { validateConfig } from "./config.js";
import { generateLlmsTxt } from "./generators/llms-txt.js";
import { generateRobotsTxt } from "./generators/robots-txt.js";
import { generateSitemap } from "./generators/sitemap.js";

/**
 * Generate all GEO-SEO files and write them to the output directory.
 */
export async function generateAll(config: GeoSeoConfig): Promise<GenerateResult> {
  const errors = validateConfig(config);
  if (errors.length > 0) {
    throw new Error(`Invalid config: ${errors.join(", ")}`);
  }

  const outDir = resolve(config.output ?? "./public");
  await mkdir(outDir, { recursive: true });

  const files: GeneratedFile[] = [];

  // llms.txt
  const llmsTxt = generateLlmsTxt(config);
  const llmsPath = join(outDir, "llms.txt");
  await writeFile(llmsPath, llmsTxt, "utf-8");
  files.push({ name: "llms.txt", path: llmsPath, size: Buffer.byteLength(llmsTxt) });

  // robots.txt
  const robotsTxt = generateRobotsTxt(config);
  const robotsPath = join(outDir, "robots.txt");
  await writeFile(robotsPath, robotsTxt, "utf-8");
  files.push({ name: "robots.txt", path: robotsPath, size: Buffer.byteLength(robotsTxt) });

  // sitemap.xml
  const sitemap = generateSitemap(config);
  const sitemapPath = join(outDir, "sitemap.xml");
  await writeFile(sitemapPath, sitemap, "utf-8");
  files.push({ name: "sitemap.xml", path: sitemapPath, size: Buffer.byteLength(sitemap) });

  return { files, count: files.length };
}
