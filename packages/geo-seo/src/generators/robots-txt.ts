import type { AiCrawler, GeoSeoConfig } from "../types.js";

/** All known AI crawlers */
const ALL_AI_CRAWLERS: AiCrawler[] = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Amazonbot",
  "CCBot",
  "Google-Extended",
  "FacebookBot",
  "Bytespider",
  "Applebot-Extended",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "YouBot",
];

/**
 * Generate robots.txt content with AI crawler rules.
 */
export function generateRobotsTxt(config: GeoSeoConfig): string {
  const lines: string[] = [];
  const robots = config.robots ?? { aiCrawlers: "allow" };

  // Default user-agent
  lines.push("User-agent: *");
  lines.push("Allow: /");
  lines.push("");

  // AI crawler rules
  switch (robots.aiCrawlers) {
    case "allow":
      lines.push("# AI Crawlers: Allowed");
      lines.push("# All AI crawlers can access this site");
      break;

    case "block":
      lines.push("# AI Crawlers: Blocked");
      for (const crawler of ALL_AI_CRAWLERS) {
        lines.push(`User-agent: ${crawler}`);
        lines.push("Disallow: /");
        lines.push("");
      }
      break;

    case "selective": {
      const allowed = robots.allow ?? [];
      const blocked = robots.block ?? [];

      if (blocked.length > 0) {
        lines.push("# AI Crawlers: Selectively blocked");
        for (const crawler of blocked) {
          lines.push(`User-agent: ${crawler}`);
          lines.push("Disallow: /");
          lines.push("");
        }
      }

      if (allowed.length > 0) {
        lines.push("# AI Crawlers: Selectively allowed");
        for (const crawler of allowed) {
          lines.push(`User-agent: ${crawler}`);
          lines.push("Allow: /");
          lines.push("");
        }
      }
      break;
    }
  }

  // Custom rules
  if (robots.customRules?.length) {
    lines.push("# Custom rules");
    for (const rule of robots.customRules) {
      lines.push(`User-agent: ${rule.userAgent}`);
      if (rule.allow) {
        for (const path of rule.allow) {
          lines.push(`Allow: ${path}`);
        }
      }
      if (rule.disallow) {
        for (const path of rule.disallow) {
          lines.push(`Disallow: ${path}`);
        }
      }
      lines.push("");
    }
  }

  // Crawl delay
  if (robots.crawlDelay !== undefined) {
    lines.push(`Crawl-delay: ${robots.crawlDelay}`);
    lines.push("");
  }

  // Sitemap
  const siteUrl = config.site.url.replace(/\/+$/, "");
  const sitemapUrl = robots.sitemap ?? `${siteUrl}/sitemap.xml`;
  lines.push(`Sitemap: ${sitemapUrl}`);
  lines.push("");

  return lines.join("\n");
}
