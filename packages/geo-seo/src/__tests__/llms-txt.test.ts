import { describe, it, expect } from "vitest";
import { generateLlmsTxt } from "../generators/llms-txt.js";
import type { GeoSeoConfig } from "../types.js";

function makeConfig(overrides?: Partial<GeoSeoConfig>): GeoSeoConfig {
  return {
    site: {
      name: "Test Site",
      url: "https://example.com",
      description: "A test site",
    },
    pages: [
      { path: "/", title: "Home", description: "Welcome page" },
      { path: "/about", title: "About", description: "About us" },
      { path: "/blog", title: "Blog", description: "Latest posts" },
    ],
    ...overrides,
  };
}

describe("generateLlmsTxt", () => {
  it("generates valid llms.txt with header", () => {
    const result = generateLlmsTxt(makeConfig());
    expect(result).toContain("# Test Site");
    expect(result).toContain("> A test site");
  });

  it("includes all page entries as markdown links", () => {
    const result = generateLlmsTxt(makeConfig());
    expect(result).toContain("[Home](https://example.com/)");
    expect(result).toContain("[About](https://example.com/about)");
    expect(result).toContain("[Blog](https://example.com/blog)");
  });

  it("includes descriptions after links", () => {
    const result = generateLlmsTxt(makeConfig());
    expect(result).toContain("Welcome page");
    expect(result).toContain("About us");
  });

  it("creates a Pages section for non-root pages", () => {
    const result = generateLlmsTxt(makeConfig());
    expect(result).toContain("## Pages");
  });

  it("handles site URL with trailing slash", () => {
    const result = generateLlmsTxt(makeConfig({
      site: { name: "Test", url: "https://example.com/", description: "Test" },
    }));
    expect(result).toContain("https://example.com/about");
    expect(result).not.toContain("https://example.com//about");
  });

  it("handles a single page", () => {
    const result = generateLlmsTxt(makeConfig({
      pages: [{ path: "/", title: "Home", description: "Welcome" }],
    }));
    expect(result).toContain("[Home](https://example.com/)");
    expect(result).not.toContain("## Pages");
  });

  it("handles pages without root path", () => {
    const result = generateLlmsTxt(makeConfig({
      pages: [
        { path: "/docs", title: "Docs", description: "Documentation" },
        { path: "/api", title: "API", description: "API reference" },
      ],
    }));
    expect(result).toContain("## Pages");
    expect(result).toContain("[Docs](https://example.com/docs)");
  });

  it("produces valid markdown format", () => {
    const result = generateLlmsTxt(makeConfig());
    const lines = result.split("\n");
    // First line is the title
    expect(lines[0]).toMatch(/^# /);
    // Has a blockquote for description
    expect(result).toMatch(/^> /m);
    // Links are in markdown format
    expect(result).toMatch(/- \[.+\]\(https:\/\/.+\): .+/);
  });

  it("handles many pages", () => {
    const pages = Array.from({ length: 20 }, (_, i) => ({
      path: `/page-${i}`,
      title: `Page ${i}`,
      description: `Description for page ${i}`,
    }));
    const result = generateLlmsTxt(makeConfig({ pages }));
    expect(result).toContain("[Page 0](https://example.com/page-0)");
    expect(result).toContain("[Page 19](https://example.com/page-19)");
  });
});
