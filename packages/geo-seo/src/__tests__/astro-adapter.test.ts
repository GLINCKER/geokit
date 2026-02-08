import { describe, it, expect } from "vitest";
import { geoSeoIntegration, getJsonLdScript } from "../adapters/astro.js";
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

describe("geoSeoIntegration (Astro)", () => {
  it("returns a valid Astro integration object", () => {
    const integration = geoSeoIntegration(validConfig);
    expect(integration.name).toBe("geo-seo");
    expect(integration.hooks).toBeDefined();
    expect(typeof integration.hooks["astro:build:done"]).toBe("function");
  });

  it("throws on invalid config", () => {
    expect(() =>
      geoSeoIntegration({ site: {} as GeoSeoConfig["site"], pages: [] }),
    ).toThrow("Invalid GEO-SEO config");
  });

  it("has the correct integration name", () => {
    const integration = geoSeoIntegration(validConfig);
    expect(integration.name).toBe("geo-seo");
  });

  it("has astro:build:done hook", () => {
    const integration = geoSeoIntegration(validConfig);
    expect(integration.hooks["astro:build:done"]).toBeDefined();
    expect(typeof integration.hooks["astro:build:done"]).toBe("function");
  });

  it("only has build:done hook (no other hooks)", () => {
    const integration = geoSeoIntegration(validConfig);
    const hookKeys = Object.keys(integration.hooks);
    expect(hookKeys).toEqual(["astro:build:done"]);
  });

  it("validates config eagerly on creation", () => {
    const badConfig = { site: { name: "", url: "", description: "" }, pages: [] };
    expect(() => geoSeoIntegration(badConfig)).toThrow("Invalid GEO-SEO config");
  });
});

describe("getJsonLdScript (Astro)", () => {
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
