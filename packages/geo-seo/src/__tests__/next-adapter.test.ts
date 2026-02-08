import { describe, it, expect, vi, beforeEach } from "vitest";
import { withGeoSEO, getJsonLdScript } from "../adapters/next.js";
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

describe("withGeoSEO", () => {
  it("returns a function that wraps Next.js config", () => {
    const wrapper = withGeoSEO(validConfig);
    expect(typeof wrapper).toBe("function");
  });

  it("preserves original Next.js config properties", () => {
    const wrapper = withGeoSEO(validConfig);
    const result = wrapper({ reactStrictMode: true, poweredByHeader: false });
    expect(result.reactStrictMode).toBe(true);
    expect(result.poweredByHeader).toBe(false);
  });

  it("adds webpack function to config", () => {
    const wrapper = withGeoSEO(validConfig);
    const result = wrapper({ reactStrictMode: true });
    expect(typeof result.webpack).toBe("function");
  });

  it("throws on invalid config", () => {
    expect(() =>
      withGeoSEO({ site: {} as GeoSeoConfig["site"], pages: [] }),
    ).toThrow("Invalid GEO-SEO config");
  });

  it("chains existing webpack config", () => {
    const existingWebpack = vi.fn((config: Record<string, unknown>) => {
      return { ...config, customPlugin: true };
    });
    const wrapper = withGeoSEO(validConfig);
    const result = wrapper({ webpack: existingWebpack });

    const webpackFn = result.webpack as (config: Record<string, unknown>, options: Record<string, unknown>) => Record<string, unknown>;
    const webpackResult = webpackFn({ plugins: [] }, { isServer: true });
    expect(existingWebpack).toHaveBeenCalled();
    expect(webpackResult.customPlugin).toBe(true);
  });

  it("only adds plugin on server build", () => {
    const wrapper = withGeoSEO(validConfig);
    const result = wrapper({});
    const webpackFn = result.webpack as (config: Record<string, unknown>, options: Record<string, unknown>) => Record<string, unknown>;

    const clientConfig = { plugins: [] as unknown[] };
    webpackFn(clientConfig, { isServer: false });
    expect(clientConfig.plugins).toHaveLength(0);

    const serverConfig = { plugins: [] as unknown[] };
    webpackFn(serverConfig, { isServer: true });
    expect(serverConfig.plugins).toHaveLength(1);
  });
});

describe("getJsonLdScript", () => {
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
