import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateAll } from "../generate.js";
import { readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import type { GeoSeoConfig } from "../types.js";

const TEST_OUT_DIR = "./temp-test-output";

const mockConfig: GeoSeoConfig = {
  site: {
    name: "Integration Test Site",
    url: "https://integration.test",
    description: "Testing generation",
    logo: "/logo.png",
  },
  pages: [
    { path: "/", title: "Home", description: "Welcome" },
    { path: "/about", title: "About", description: "About Us" },
  ],
  output: TEST_OUT_DIR,
};

describe("generateAll integration", () => {
  beforeEach(async () => {
    // Ensure clean state
    await rm(TEST_OUT_DIR, { recursive: true, force: true });
  });

  afterEach(async () => {
    // Cleanup
    await rm(TEST_OUT_DIR, { recursive: true, force: true });
  });

  it("generates all 3 files in the output directory", async () => {
    const result = await generateAll(mockConfig);
    
    expect(result.count).toBe(3);
    expect(result.files).toHaveLength(3);
    
    // Check llms.txt
    const llmsPath = join(TEST_OUT_DIR, "llms.txt");
    const llmsStats = await stat(llmsPath);
    expect(llmsStats.isFile()).toBe(true);
    const llmsContent = await readFile(llmsPath, "utf-8");
    expect(llmsContent).toContain("# Integration Test Site");
    expect(llmsContent).toContain("- [Home](https://integration.test/)");

    // Check robots.txt
    const robotsPath = join(TEST_OUT_DIR, "robots.txt");
    const robotsStats = await stat(robotsPath);
    expect(robotsStats.isFile()).toBe(true);
    const robotsContent = await readFile(robotsPath, "utf-8");
    expect(robotsContent).toContain("User-agent: *");
    expect(robotsContent).toContain("Sitemap: https://integration.test/sitemap.xml");

    // Check sitemap.xml
    const sitemapPath = join(TEST_OUT_DIR, "sitemap.xml");
    const sitemapStats = await stat(sitemapPath);
    expect(sitemapStats.isFile()).toBe(true);
    const sitemapContent = await readFile(sitemapPath, "utf-8");
    expect(sitemapContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemapContent).toContain("<loc>https://integration.test</loc>");
    expect(sitemapContent).toContain("<loc>https://integration.test/about</loc>");
  });

  it("throws error for invalid config", async () => {
    const invalidConfig = { ...mockConfig, site: { ...mockConfig.site, url: "" } }; // Empty URL invalid
    await expect(generateAll(invalidConfig)).rejects.toThrow("Invalid config");
  });
});
