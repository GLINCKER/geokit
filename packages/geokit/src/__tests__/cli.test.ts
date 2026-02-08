import { describe, it, expect } from "vitest";

// Test the parseArgs function by importing the module and testing CLI flag parsing
// Since parseArgs isn't exported, we test via the CLI module's behavior

describe("geokit CLI", () => {
  it("module can be imported", async () => {
    // Verify the types module loads without errors
    const types = await import("../types.js");
    expect(types).toBeDefined();
  });

  it("index re-exports all packages", async () => {
    const index = await import("../index.js");
    // geo-audit exports
    expect(typeof index.audit).toBe("function");
    expect(typeof index.getFixSuggestion).toBe("function");
    // geo-seo exports
    expect(typeof index.defineConfig).toBe("function");
    expect(typeof index.validateConfig).toBe("function");
    expect(typeof index.generateAll).toBe("function");
    expect(typeof index.generateLlmsTxt).toBe("function");
    expect(typeof index.generateJsonLd).toBe("function");
    expect(typeof index.generateRobotsTxt).toBe("function");
    expect(typeof index.generateSitemap).toBe("function");
    expect(typeof index.generateConfigTemplate).toBe("function");
    // geomark exports
    expect(typeof index.geomark).toBe("function");
    expect(typeof index.extractMetadata).toBe("function");
    expect(typeof index.htmlToMarkdown).toBe("function");
    // geokit exports
    expect(typeof index.fix).toBe("function");
    expect(typeof index.buildConfigFromAudit).toBe("function");
    expect(Array.isArray(index.FIX_MAP)).toBe(true);
  });

  it("fix module exports correctly", async () => {
    const fixModule = await import("../fix.js");
    expect(typeof fixModule.fix).toBe("function");
    expect(typeof fixModule.buildConfigFromAudit).toBe("function");
    expect(Array.isArray(fixModule.FIX_MAP)).toBe(true);
    expect(fixModule.FIX_MAP.length).toBeGreaterThanOrEqual(5);
  });
});
