import { describe, it, expect } from "vitest";
import { defineConfig, validateConfig, generateConfigTemplate } from "../config.js";
import type { GeoSeoConfig } from "../types.js";

describe("defineConfig", () => {
  it("returns config with defaults applied", () => {
    const config = defineConfig({
      site: { name: "Test", url: "https://example.com", description: "Test" },
      pages: [{ path: "/", title: "Home", description: "Welcome" }],
    });
    expect(config.output).toBe("./public");
    expect(config.robots?.aiCrawlers).toBe("allow");
  });

  it("preserves user-provided values", () => {
    const config = defineConfig({
      site: { name: "Test", url: "https://example.com", description: "Test" },
      pages: [{ path: "/", title: "Home", description: "Welcome" }],
      output: "./dist",
      robots: { aiCrawlers: "block" },
    });
    expect(config.output).toBe("./dist");
    expect(config.robots?.aiCrawlers).toBe("block");
  });
});

describe("validateConfig", () => {
  const validConfig: GeoSeoConfig = {
    site: { name: "Test", url: "https://example.com", description: "Test" },
    pages: [{ path: "/", title: "Home", description: "Welcome" }],
  };

  it("returns empty array for valid config", () => {
    expect(validateConfig(validConfig)).toEqual([]);
  });

  it("catches missing site.name", () => {
    const config = { ...validConfig, site: { ...validConfig.site, name: "" } };
    const errors = validateConfig(config);
    expect(errors).toContain("site.name is required");
  });

  it("catches missing site.url", () => {
    const config = { ...validConfig, site: { ...validConfig.site, url: "" } };
    const errors = validateConfig(config);
    expect(errors).toContain("site.url is required");
  });

  it("catches invalid site.url protocol", () => {
    const config = { ...validConfig, site: { ...validConfig.site, url: "example.com" } };
    const errors = validateConfig(config);
    expect(errors).toContain("site.url must start with http:// or https://");
  });

  it("catches empty pages array", () => {
    const config = { ...validConfig, pages: [] };
    const errors = validateConfig(config);
    expect(errors).toContain("pages must have at least one entry");
  });

  it("catches invalid priority", () => {
    const config = {
      ...validConfig,
      pages: [{ path: "/", title: "Home", description: "Welcome", priority: 2.0 }],
    };
    const errors = validateConfig(config);
    expect(errors.some((e) => e.includes("priority"))).toBe(true);
  });

  it("catches selective robots without allow/block", () => {
    const config = { ...validConfig, robots: { aiCrawlers: "selective" as const } };
    const errors = validateConfig(config);
    expect(errors.some((e) => e.includes("robots.allow or robots.block"))).toBe(true);
  });
});

describe("generateConfigTemplate", () => {
  it("generates a valid TypeScript config template", () => {
    const template = generateConfigTemplate();
    expect(template).toContain("import { defineConfig }");
    expect(template).toContain("export default defineConfig");
    expect(template).toContain("site:");
    expect(template).toContain("pages:");
  });
});
