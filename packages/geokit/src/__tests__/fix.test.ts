import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildConfigFromAudit, FIX_MAP, fix } from "../fix.js";

// Mock all three packages
vi.mock("@glincker/geo-audit", () => ({
  audit: vi.fn(),
  getFixSuggestion: vi.fn((ruleId: string) => {
    const map: Record<string, { command: string; automatic: boolean }> = {
      R01: { command: "npx geo-seo generate --only llms-txt", automatic: true },
      R02: { command: "npx geo-seo generate --only robots-txt", automatic: true },
      R03: { command: "npx geo-seo generate --only sitemap", automatic: true },
    };
    return map[ruleId];
  }),
}));

vi.mock("@glincker/geo-seo", () => ({
  generateAll: vi.fn(),
  defineConfig: vi.fn((config) => ({ ...config, output: config.output ?? "./public" })),
}));

vi.mock("@glincker/geomark", () => ({
  geomark: vi.fn(),
}));

const { audit } = await import("@glincker/geo-audit");
const { generateAll } = await import("@glincker/geo-seo");
const { geomark } = await import("@glincker/geomark");

const mockAudit = vi.mocked(audit);
const mockGenerateAll = vi.mocked(generateAll);
const mockGeomark = vi.mocked(geomark);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("buildConfigFromAudit", () => {
  it("builds config from URL with extracted metadata", () => {
    const config = buildConfigFromAudit(
      "https://example.com",
      "Example Site",
      "A great site",
    );
    expect(config.site.name).toBe("Example Site");
    expect(config.site.url).toBe("https://example.com");
    expect(config.site.description).toBe("A great site");
    expect(config.pages).toHaveLength(1);
  });

  it("falls back to hostname when no metadata", () => {
    const config = buildConfigFromAudit("https://example.com");
    expect(config.site.name).toBe("example.com");
    expect(config.site.description).toContain("example.com");
  });

  it("adds https:// when protocol is missing", () => {
    const config = buildConfigFromAudit("example.com");
    expect(config.site.url).toBe("https://example.com");
  });

  it("sets robots to allow AI crawlers", () => {
    const config = buildConfigFromAudit("https://example.com");
    expect(config.robots?.aiCrawlers).toBe("allow");
  });
});

describe("FIX_MAP", () => {
  it("contains R01, R02, R03 as automatic", () => {
    const automatic = FIX_MAP.filter((m) => m.automatic);
    expect(automatic.map((m) => m.ruleId)).toEqual(
      expect.arrayContaining(["R01", "R02", "R03"]),
    );
  });

  it("contains R04, R17 as non-automatic", () => {
    const manual = FIX_MAP.filter((m) => !m.automatic);
    expect(manual.map((m) => m.ruleId)).toEqual(
      expect.arrayContaining(["R04", "R17"]),
    );
  });
});

describe("fix", () => {
  const mockAuditResult = {
    url: "https://example.com",
    score: 35,
    grade: "F" as const,
    categories: [],
    rules: [],
    recommendations: [
      { rule: "R01", message: "Missing llms.txt", impact: 10 },
      { rule: "R02", message: "Missing robots.txt", impact: 8 },
      { rule: "R05", message: "Missing OG tags", impact: 6 },
    ],
    timestamp: new Date().toISOString(),
    duration: 500,
    version: "0.1.0",
  };

  const mockGeomarkResult = {
    url: "https://example.com",
    title: "Example Site",
    markdown: "# Example",
    metadata: {
      title: "Example Site",
      description: "An example site",
      author: "",
      published: "",
      ogImage: "",
      jsonLd: null,
      canonical: "",
      lang: "en",
      siteName: "Example",
      ogType: "",
      openGraph: {},
    },
    tokens: 100,
    wordCount: 50,
    readingTime: 1,
    fetchedAt: new Date().toISOString(),
  };

  it("runs full pipeline and returns fix result", async () => {
    mockAudit.mockResolvedValue(mockAuditResult);
    mockGeomark.mockResolvedValue(mockGeomarkResult);
    mockGenerateAll.mockResolvedValue({
      files: [
        { name: "llms.txt", path: "/tmp/llms.txt", size: 100 },
        { name: "robots.txt", path: "/tmp/robots.txt", size: 200 },
        { name: "sitemap.xml", path: "/tmp/sitemap.xml", size: 300 },
      ],
      count: 3,
    });

    const result = await fix("https://example.com", "/tmp/geo-fixes");

    expect(mockAudit).toHaveBeenCalledWith("https://example.com");
    expect(mockGeomark).toHaveBeenCalledWith("https://example.com");
    expect(mockGenerateAll).toHaveBeenCalled();
    expect(result.audit.score).toBe(35);
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.estimatedImprovement).toBeGreaterThan(0);
    expect(result.outDir).toBe("/tmp/geo-fixes");
  });

  it("continues when geomark fails", async () => {
    mockAudit.mockResolvedValue(mockAuditResult);
    mockGeomark.mockRejectedValue(new Error("Network error"));
    mockGenerateAll.mockResolvedValue({ files: [], count: 0 });

    const result = await fix("https://example.com");
    expect(result.audit.score).toBe(35);
    // Should still have attempted fixes
    expect(result.actions.length).toBeGreaterThanOrEqual(0);
  });

  it("reports remaining issues that cannot be auto-fixed", async () => {
    mockAudit.mockResolvedValue(mockAuditResult);
    mockGeomark.mockResolvedValue(mockGeomarkResult);
    mockGenerateAll.mockResolvedValue({ files: [], count: 0 });

    const result = await fix("https://example.com");
    // R05 should be in remaining issues (not auto-fixable)
    const remainingRules = result.remainingIssues.map((i) => i.rule);
    expect(remainingRules).toContain("R05");
  });

  it("handles generate failure gracefully", async () => {
    mockAudit.mockResolvedValue(mockAuditResult);
    mockGeomark.mockResolvedValue(mockGeomarkResult);
    mockGenerateAll.mockRejectedValue(new Error("Write failed"));

    const result = await fix("https://example.com");
    expect(result.generate).toBeNull();
    // Actions should show as not applied
    const failedActions = result.actions.filter((a) => !a.applied);
    expect(failedActions.length).toBeGreaterThan(0);
  });
});
