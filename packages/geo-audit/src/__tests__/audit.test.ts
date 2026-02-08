import { describe, it, expect, vi } from "vitest";
import { audit } from "../audit.js";

// Mock fetchPageData with complete PageData structure
vi.mock("../fetcher.js", () => ({
  fetchPageData: vi.fn().mockResolvedValue({
    url: "https://example.com",
    html: "<html><body><h1>Test</h1><p>Content</p></body></html>",
    statusCode: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
    ttfb: 100,
    totalTime: 200,
    llmsTxt: { ok: false, status: 404, body: "" },
    robotsTxt: { ok: true, status: 200, body: "User-agent: *\nDisallow:" },
    sitemapXml: { ok: false, status: 404, body: "" },
  }),
}));

describe("audit()", () => {
  it("returns a complete AuditResult", async () => {
    const result = await audit("https://example.com");

    expect(result).toHaveProperty("url", "https://example.com");
    expect(result).toHaveProperty("score");
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);

    expect(result).toHaveProperty("grade");
    expect(["A", "B", "C", "D", "F"]).toContain(result.grade);

    expect(result).toHaveProperty("categories");
    expect(Object.keys(result.categories).length).toBeGreaterThan(0);

    expect(result).toHaveProperty("rules");
    expect(result.rules.length).toBeGreaterThan(0);

    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("version");
    expect(result).toHaveProperty("duration");

    // Verify recommendations exists (array)
    expect(Array.isArray(result.recommendations)).toBe(true);
    
    // Check if R08 (Headings) ran
    const r08 = result.rules.find(r => r.id === "R08");
    expect(r08).toBeDefined();
  });
});
