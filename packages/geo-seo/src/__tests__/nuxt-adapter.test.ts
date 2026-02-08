import { describe, it, expect, vi } from "vitest";
import { geoSeoModule, getJsonLdScript } from "../adapters/nuxt.js";
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

describe("geoSeoModule (Nuxt)", () => {
  it("returns a Nuxt module function", () => {
    const module = geoSeoModule(validConfig);
    expect(typeof module).toBe("function");
  });

  it("throws on invalid config", () => {
    expect(() =>
      geoSeoModule({ site: {} as GeoSeoConfig["site"], pages: [] }),
    ).toThrow("Invalid GEO-SEO config");
  });

  it("registers nitro:build:public-assets hook when called", () => {
    const module = geoSeoModule(validConfig);
    const hookFn = vi.fn();
    const nuxt = {
      hook: hookFn,
      options: { rootDir: "/tmp/project" },
    };

    module(nuxt);
    expect(hookFn).toHaveBeenCalledWith(
      "nitro:build:public-assets",
      expect.any(Function),
    );
  });

  it("validates config eagerly on creation", () => {
    const badConfig = { site: { name: "", url: "", description: "" }, pages: [] };
    expect(() => geoSeoModule(badConfig)).toThrow("Invalid GEO-SEO config");
  });

  it("module function has correct name", () => {
    const module = geoSeoModule(validConfig);
    expect(module.name).toBe("geoSeoNuxtModule");
  });

  it("hooks are registered on the nuxt instance", () => {
    const module = geoSeoModule(validConfig);
    const hooks: Array<[string, unknown]> = [];
    const nuxt = {
      hook: (name: string, fn: unknown) => hooks.push([name, fn]),
      options: { rootDir: "/tmp/project" },
    };

    module(nuxt);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]![0]).toBe("nitro:build:public-assets");
  });
});

describe("getJsonLdScript (Nuxt)", () => {
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
