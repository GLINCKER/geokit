import * as cheerio from "cheerio";
import type { PageMetadata } from "./types.js";

/**
 * Extract metadata from HTML (OG tags, JSON-LD, meta tags).
 */
export function extractMetadata(html: string): PageMetadata {
  const $ = cheerio.load(html);

  // Open Graph tags
  const openGraph: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr("property")?.replace("og:", "") ?? "";
    const content = $(el).attr("content") ?? "";
    if (prop && content) {
      openGraph[prop] = content;
    }
  });

  // Also grab article: tags
  $('meta[property^="article:"]').each((_, el) => {
    const prop = $(el).attr("property") ?? "";
    const content = $(el).attr("content") ?? "";
    if (prop && content) {
      openGraph[prop] = content;
    }
  });

  // JSON-LD
  let jsonLd: Record<string, unknown> | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (jsonLd) return; // take first one
    try {
      const raw = $(el).html();
      if (raw) {
        jsonLd = JSON.parse(raw) as Record<string, unknown>;
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  // Title extraction priority: og:title > <title> > h1
  const title =
    openGraph["title"] ??
    $("title").first().text().trim() ??
    $("h1").first().text().trim() ??
    "";

  // Description: og:description > meta description
  const description =
    openGraph["description"] ??
    $('meta[name="description"]').attr("content")?.trim() ??
    "";

  // Author: article:author > meta author > JSON-LD author
  const jsonLdAuthor = jsonLd ? (jsonLd["author"] as string | undefined) : undefined;
  const author =
    openGraph["article:author"] ??
    $('meta[name="author"]').attr("content")?.trim() ??
    jsonLdAuthor ??
    "";

  // Published date: article:published_time > datePublished in JSON-LD
  const jsonLdDate = jsonLd ? (jsonLd["datePublished"] as string | undefined) : undefined;
  const published =
    openGraph["article:published_time"] ??
    jsonLdDate ??
    "";

  // Canonical URL
  const canonical =
    $('link[rel="canonical"]').attr("href")?.trim() ?? "";

  // Language
  const lang =
    $("html").attr("lang")?.trim() ?? "";

  return {
    title,
    description,
    author,
    published,
    ogImage: openGraph["image"] ?? "",
    jsonLd,
    canonical,
    lang,
    siteName: openGraph["site_name"] ?? "",
    ogType: openGraph["type"] ?? "",
    openGraph,
  };
}
