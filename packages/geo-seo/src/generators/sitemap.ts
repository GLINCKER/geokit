import type { GeoSeoConfig } from "../types.js";

/**
 * Generate sitemap.xml content from page entries.
 */
export function generateSitemap(config: GeoSeoConfig): string {
  const baseUrl = config.site.url.replace(/\/+$/, "");
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const page of config.pages) {
    const url = `${baseUrl}${page.path === "/" ? "" : page.path}`;
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(url)}</loc>`);

    if (page.lastmod) {
      lines.push(`    <lastmod>${page.lastmod}</lastmod>`);
    }

    if (page.changefreq) {
      lines.push(`    <changefreq>${page.changefreq}</changefreq>`);
    }

    if (page.priority !== undefined) {
      lines.push(`    <priority>${page.priority.toFixed(1)}</priority>`);
    }

    lines.push("  </url>");
  }

  lines.push("</urlset>");
  lines.push("");

  return lines.join("\n");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
