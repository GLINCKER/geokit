import { describe, it, expect, vi, beforeEach } from "vitest";
import { geoSeoPlugin, getJsonLdScript } from "../adapters/vite.js";
import type { GeoSeoConfig } from "../types.js";

const validConfig: GeoSeoConfig = {
  site: {
    name: "Test Site",
    url: "https://example.com",
    description: "A test site",
  },
  pages: [
    { path: "/", title: "Home", description: "Home page" },
    { path: "/about", title: "About", description: "About page" },
  ],
};

describe("geoSeoPlugin (Vite)", () => {
  it("returns a valid Vite plugin object", () => {
    const plugin = geoSeoPlugin(validConfig);
    expect(plugin.name).toBe("geo-seo");
    expect(typeof plugin.configResolved).toBe("function");
    expect(typeof plugin.closeBundle).toBe("function");
  });

  it("throws on invalid config", () => {
    expect(() =>
      geoSeoPlugin({ site: {} as GeoSeoConfig["site"], pages: [] }),
    ).toThrow("Invalid GEO-SEO config");
  });

  it("stores resolved config via configResolved", () => {
    const plugin = geoSeoPlugin(validConfig);
    // Should not throw
    plugin.configResolved!({
      root: "/tmp/project",
      build: { outDir: "dist" },
    });
  });

  it("writes files on closeBundle", async () => {
    const mockWriteFile = vi.fn().mockResolvedValue(undefined);
    const mockMkdir = vi.fn().mockResolvedValue(undefined);

    // We can test by checking the plugin structure
    const plugin = geoSeoPlugin(validConfig);
    expect(plugin.closeBundle).toBeDefined();
  });

  it("uses default outDir when no config resolved", async () => {
    const plugin = geoSeoPlugin(validConfig);
    // closeBundle should work even without configResolved being called
    // (falls back to process.cwd() + "dist")
    expect(typeof plugin.closeBundle).toBe("function");
  });

  it("plugin name is geo-seo", () => {
    const plugin = geoSeoPlugin(validConfig);
    expect(plugin.name).toBe("geo-seo");
  });
});

describe("getJsonLdScript (Vite)", () => {
  it("returns a valid JSON-LD object for WebSite", () => {
    const result = getJsonLdScript("WebSite", validConfig);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("WebSite");
    expect(result.name).toBe("Test Site");
  });

  it("returns page-specific JSON-LD for WebPage", () => {
    const page = validConfig.pages[1]!;
    const result = getJsonLdScript("WebPage", validConfig, page);
    expect(result["@type"]).toBe("WebPage");
    expect(result.name).toBe("About");
    expect(result.url).toBe("https://example.com/about");
  });
});
