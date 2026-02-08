import type { GeoSeoConfig } from "../types.js";

/**
 * Generate llms.txt content following the specification.
 * @see https://llmstxt.org
 *
 * Format:
 * # Site Name
 * > Site description
 *
 * ## Section
 * - [Title](url): Description
 */
export function generateLlmsTxt(config: GeoSeoConfig): string {
  const { site, pages } = config;
  const lines: string[] = [];

  // Header
  lines.push(`# ${site.name}`);
  lines.push("");
  lines.push(`> ${site.description}`);
  lines.push("");

  // Group pages by section
  const mainPages = pages.filter((p) => p.path === "/");
  const otherPages = pages.filter((p) => p.path !== "/");

  // Main section
  if (mainPages.length > 0) {
    for (const page of mainPages) {
      lines.push(`- [${page.title}](${buildUrl(site.url, page.path)}): ${page.description}`);
    }
    lines.push("");
  }

  // Other pages section
  if (otherPages.length > 0) {
    lines.push("## Pages");
    lines.push("");
    for (const page of otherPages) {
      lines.push(`- [${page.title}](${buildUrl(site.url, page.path)}): ${page.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const pagePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${pagePath}`;
}
