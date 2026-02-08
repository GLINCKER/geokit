import { describe, it, expect } from "vitest";
import { extractMetadata } from "../metadata.js";

describe("extractMetadata", () => {
  it("extracts title from <title> tag", () => {
    const html = "<html><head><title>Test Page</title></head><body></body></html>";
    const meta = extractMetadata(html);
    expect(meta.title).toBe("Test Page");
  });

  it("prefers og:title over <title>", () => {
    const html = `<html><head>
      <title>Fallback Title</title>
      <meta property="og:title" content="OG Title">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.title).toBe("OG Title");
  });

  it("extracts og:description", () => {
    const html = `<html><head>
      <meta property="og:description" content="OG description here">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.description).toBe("OG description here");
  });

  it("falls back to meta description", () => {
    const html = `<html><head>
      <meta name="description" content="Meta description">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.description).toBe("Meta description");
  });

  it("extracts canonical URL", () => {
    const html = `<html><head>
      <link rel="canonical" href="https://example.com/page">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.canonical).toBe("https://example.com/page");
  });

  it("extracts lang attribute", () => {
    const html = `<html lang="en"><head></head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.lang).toBe("en");
  });

  it("extracts JSON-LD data", () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@type":"Article","headline":"Test"}</script>
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.jsonLd).toEqual({ "@type": "Article", headline: "Test" });
  });

  it("handles invalid JSON-LD gracefully", () => {
    const html = `<html><head>
      <script type="application/ld+json">not valid json</script>
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.jsonLd).toBeNull();
  });

  it("extracts og:image", () => {
    const html = `<html><head>
      <meta property="og:image" content="https://example.com/og.png">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.ogImage).toBe("https://example.com/og.png");
  });

  it("extracts og:site_name", () => {
    const html = `<html><head>
      <meta property="og:site_name" content="My Site">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.siteName).toBe("My Site");
  });

  it("extracts author from meta tag", () => {
    const html = `<html><head>
      <meta name="author" content="Jane Doe">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.author).toBe("Jane Doe");
  });

  it("collects all OG tags", () => {
    const html = `<html><head>
      <meta property="og:title" content="Title">
      <meta property="og:type" content="article">
      <meta property="og:url" content="https://example.com">
    </head><body></body></html>`;
    const meta = extractMetadata(html);
    expect(meta.openGraph.title).toBe("Title");
    expect(meta.openGraph.type).toBe("article");
    expect(meta.openGraph.url).toBe("https://example.com");
  });

  it("returns empty strings for missing metadata", () => {
    const html = "<html><head></head><body></body></html>";
    const meta = extractMetadata(html);
    expect(meta.title).toBe("");
    expect(meta.description).toBe("");
    expect(meta.author).toBe("");
    expect(meta.canonical).toBe("");
  });
});
