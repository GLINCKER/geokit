import { describe, it, expect } from "vitest";
import { generateRobotsTxt } from "../generators/robots-txt.js";
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
    ],
    ...overrides,
  };
}

describe("generateRobotsTxt", () => {
  it("includes default user-agent allow rule", () => {
    const result = generateRobotsTxt(makeConfig());
    expect(result).toContain("User-agent: *");
    expect(result).toContain("Allow: /");
  });

  it("includes sitemap URL", () => {
    const result = generateRobotsTxt(makeConfig());
    expect(result).toContain("Sitemap: https://example.com/sitemap.xml");
  });

  it("uses custom sitemap URL", () => {
    const result = generateRobotsTxt(makeConfig({
      robots: { aiCrawlers: "allow", sitemap: "https://example.com/custom-sitemap.xml" },
    }));
    expect(result).toContain("Sitemap: https://example.com/custom-sitemap.xml");
  });

  it("allows all AI crawlers in allow mode", () => {
    const result = generateRobotsTxt(makeConfig({ robots: { aiCrawlers: "allow" } }));
    expect(result).toContain("AI Crawlers: Allowed");
    expect(result).not.toContain("Disallow");
  });

  it("blocks all AI crawlers in block mode", () => {
    const result = generateRobotsTxt(makeConfig({ robots: { aiCrawlers: "block" } }));
    expect(result).toContain("User-agent: GPTBot");
    expect(result).toContain("User-agent: ClaudeBot");
    expect(result).toContain("User-agent: PerplexityBot");
    // After each AI crawler there should be Disallow: /
    const lines = result.split("\n");
    const gptBotIdx = lines.findIndex((l) => l === "User-agent: GPTBot");
    expect(lines[gptBotIdx + 1]).toBe("Disallow: /");
  });

  it("selectively blocks specific crawlers", () => {
    const result = generateRobotsTxt(makeConfig({
      robots: { aiCrawlers: "selective", block: ["CCBot", "Bytespider"] },
    }));
    expect(result).toContain("User-agent: CCBot");
    expect(result).toContain("User-agent: Bytespider");
    expect(result).not.toContain("User-agent: GPTBot");
  });

  it("selectively allows specific crawlers", () => {
    const result = generateRobotsTxt(makeConfig({
      robots: { aiCrawlers: "selective", allow: ["GPTBot", "ClaudeBot"] },
    }));
    expect(result).toContain("User-agent: GPTBot");
    expect(result).toContain("User-agent: ClaudeBot");
    const lines = result.split("\n");
    const gptIdx = lines.findIndex((l) => l === "User-agent: GPTBot");
    expect(lines[gptIdx + 1]).toBe("Allow: /");
  });

  it("includes crawl delay when set", () => {
    const result = generateRobotsTxt(makeConfig({
      robots: { aiCrawlers: "allow", crawlDelay: 10 },
    }));
    expect(result).toContain("Crawl-delay: 10");
  });

  it("includes custom rules", () => {
    const result = generateRobotsTxt(makeConfig({
      robots: {
        aiCrawlers: "allow",
        customRules: [
          { userAgent: "Googlebot", disallow: ["/admin", "/private"] },
        ],
      },
    }));
    expect(result).toContain("User-agent: Googlebot");
    expect(result).toContain("Disallow: /admin");
    expect(result).toContain("Disallow: /private");
  });

  it("handles trailing slash in site URL", () => {
    const result = generateRobotsTxt(makeConfig({
      site: { name: "Test", url: "https://example.com/", description: "Test" },
    }));
    expect(result).toContain("Sitemap: https://example.com/sitemap.xml");
    expect(result).not.toContain("https://example.com//");
  });
});
