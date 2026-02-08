import { describe, it, expect } from "vitest";
import { r03Sitemap } from "../rules/r03-sitemap.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R03: Sitemap.xml", () => {
  it("passes with valid XML sitemap", () => {
    const page = mockPage({
      sitemapXml: mockFetch({
        body: '<?xml version="1.0"?><urlset><url><loc>https://example.com</loc></url></urlset>',
      }),
    });
    const result = r03Sitemap.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
  });

  it("passes with sitemapindex", () => {
    const page = mockPage({
      sitemapXml: mockFetch({
        body: '<?xml version="1.0"?><sitemapindex><sitemap><loc>https://example.com/sitemap-1.xml</loc></sitemap></sitemapindex>',
      }),
    });
    const result = r03Sitemap.check(page);
    expect(result.status).toBe("pass");
  });

  it("warns when sitemap in robots.txt but not at /sitemap.xml", () => {
    const page = mockPage({
      sitemapXml: mockFetch({ ok: false, status: 404, body: "" }),
      robotsTxt: mockFetch({
        body: "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap-main.xml\n",
      }),
    });
    const result = r03Sitemap.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("fails when no sitemap found anywhere", () => {
    const page = mockPage({
      sitemapXml: mockFetch({ ok: false, status: 404, body: "" }),
      robotsTxt: mockFetch({ body: "User-agent: *\nAllow: /\n" }),
    });
    const result = r03Sitemap.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
