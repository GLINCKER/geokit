import { describe, it, expect } from "vitest";
import { generateSitemap } from "../generators/sitemap.js";
import type { GeoSeoConfig } from "../types.js";

function makeConfig(overrides?: Partial<GeoSeoConfig>): GeoSeoConfig {
  return {
    site: {
      name: "Test Site",
      url: "https://example.com",
      description: "A test site",
    },
    pages: [
      { path: "/", title: "Home", description: "Welcome" },
      { path: "/about", title: "About", description: "About us" },
    ],
    ...overrides,
  };
}

describe("generateSitemap", () => {
  it("generates valid XML header", () => {
    const result = generateSitemap(makeConfig());
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(result).toContain("</urlset>");
  });

  it("includes all page URLs", () => {
    const result = generateSitemap(makeConfig());
    expect(result).toContain("<loc>https://example.com</loc>");
    expect(result).toContain("<loc>https://example.com/about</loc>");
  });

  it("includes lastmod when provided", () => {
    const result = generateSitemap(makeConfig({
      pages: [{ path: "/", title: "Home", description: "Welcome", lastmod: "2025-01-01" }],
    }));
    expect(result).toContain("<lastmod>2025-01-01</lastmod>");
  });

  it("includes changefreq when provided", () => {
    const result = generateSitemap(makeConfig({
      pages: [{ path: "/", title: "Home", description: "Welcome", changefreq: "daily" }],
    }));
    expect(result).toContain("<changefreq>daily</changefreq>");
  });

  it("includes priority when provided", () => {
    const result = generateSitemap(makeConfig({
      pages: [{ path: "/", title: "Home", description: "Welcome", priority: 1.0 }],
    }));
    expect(result).toContain("<priority>1.0</priority>");
  });

  it("does not duplicate slash for root path", () => {
    const result = generateSitemap(makeConfig({
      pages: [{ path: "/", title: "Home", description: "Welcome" }],
    }));
    expect(result).toContain("<loc>https://example.com</loc>");
    expect(result).not.toContain("<loc>https://example.com/</loc>");
  });

  it("escapes special XML characters in URLs", () => {
    const result = generateSitemap(makeConfig({
      pages: [{ path: "/search?q=test&page=1", title: "Search", description: "Search results" }],
    }));
    expect(result).toContain("&amp;");
  });

  it("handles trailing slash in site URL", () => {
    const result = generateSitemap(makeConfig({
      site: { name: "Test", url: "https://example.com/", description: "Test" },
      pages: [{ path: "/about", title: "About", description: "About" }],
    }));
    expect(result).toContain("<loc>https://example.com/about</loc>");
    expect(result).not.toContain("https://example.com//about");
  });
});
