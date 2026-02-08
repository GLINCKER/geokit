import { describe, it, expect } from "vitest";
import { generateJsonLd } from "../generators/json-ld.js";
import type { GeoSeoConfig } from "../types.js";

function makeConfig(overrides?: Partial<GeoSeoConfig>): GeoSeoConfig {
  return {
    site: {
      name: "Test Site",
      url: "https://example.com",
      description: "A test site",
      logo: "/logo.png",
    },
    organization: {
      name: "Test Corp",
      url: "https://example.com",
      logo: "https://example.com/logo.png",
    },
    pages: [
      { path: "/", title: "Home", description: "Welcome page" },
    ],
    ...overrides,
  };
}

describe("generateJsonLd", () => {
  describe("Organization", () => {
    it("generates valid Organization schema", () => {
      const result = generateJsonLd("Organization", makeConfig());
      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Organization");
      expect(result.name).toBe("Test Corp");
      expect(result.url).toBe("https://example.com");
    });

    it("includes logo when provided", () => {
      const result = generateJsonLd("Organization", makeConfig());
      expect(result.logo).toBe("https://example.com/logo.png");
    });

    it("includes sameAs social profiles", () => {
      const result = generateJsonLd("Organization", makeConfig({
        organization: {
          name: "Test",
          url: "https://example.com",
          sameAs: ["https://twitter.com/test", "https://github.com/test"],
        },
      }));
      expect(result.sameAs).toEqual(["https://twitter.com/test", "https://github.com/test"]);
    });

    it("includes contactPoint when provided", () => {
      const result = generateJsonLd("Organization", makeConfig({
        organization: {
          name: "Test Corp",
          url: "https://example.com",
          contactPoint: {
            type: "CustomerService",
            telephone: "+1-800-555-5555",
            email: "support@example.com",
          },
        },
      }));
      expect(result.contactPoint).toEqual({
        "@type": "CustomerService",
        telephone: "+1-800-555-5555",
        email: "support@example.com",
      });
    });

    it("falls back to site info when no organization", () => {
      const result = generateJsonLd("Organization", makeConfig({ organization: undefined }));
      expect(result.name).toBe("Test Site");
    });
  });

  describe("WebSite", () => {
    it("generates valid WebSite schema", () => {
      const result = generateJsonLd("WebSite", makeConfig());
      expect(result["@type"]).toBe("WebSite");
      expect(result.name).toBe("Test Site");
      expect(result.url).toBe("https://example.com");
      expect(result.description).toBe("A test site");
    });
  });

  describe("WebPage", () => {
    it("generates WebPage with page data", () => {
      const config = makeConfig();
      const page = config.pages[0]!;
      const result = generateJsonLd("WebPage", config, page);
      expect(result["@type"]).toBe("WebPage");
      expect(result.name).toBe("Home");
      expect(result.url).toBe("https://example.com/");
    });

    it("merges schemaProps", () => {
      const page = { path: "/about", title: "About", description: "About us", schemaProps: { author: "Jane" } };
      const result = generateJsonLd("WebPage", makeConfig({ pages: [page] }), page);
      expect(result.author).toBe("Jane");
    });
  });

  describe("Article", () => {
    it("generates Article schema", () => {
      const page = { path: "/blog/post", title: "My Post", description: "A great post" };
      const result = generateJsonLd("Article", makeConfig(), page);
      expect(result["@type"]).toBe("Article");
      expect(result.headline).toBe("My Post");
      expect(result.url).toBe("https://example.com/blog/post");
    });

    it("includes publisher from organization", () => {
      const page = { path: "/blog/post", title: "Post", description: "A post" };
      const result = generateJsonLd("Article", makeConfig(), page);
      expect(result.publisher).toEqual({
        "@type": "Organization",
        name: "Test Corp",
        logo: "https://example.com/logo.png",
      });
    });

    it("includes dateModified from lastmod", () => {
      const page = { path: "/blog/post", title: "Post", description: "Desc", lastmod: "2025-01-01" };
      const result = generateJsonLd("Article", makeConfig(), page);
      expect(result.dateModified).toBe("2025-01-01");
    });
  });

  describe("BlogPosting", () => {
    it("generates BlogPosting schema", () => {
      const page = { path: "/blog/post", title: "Post", description: "A post" };
      const result = generateJsonLd("BlogPosting", makeConfig(), page);
      expect(result["@type"]).toBe("BlogPosting");
    });
  });

  describe("FAQPage", () => {
    it("generates FAQPage with questions", () => {
      const page = {
        path: "/faq",
        title: "FAQ",
        description: "Frequently asked questions",
        schemaProps: {
          questions: [
            { question: "What is this?", answer: "A tool" },
            { question: "How much?", answer: "Free" },
          ],
        },
      };
      const result = generateJsonLd("FAQPage", makeConfig(), page);
      expect(result["@type"]).toBe("FAQPage");
      expect(Array.isArray(result.mainEntity)).toBe(true);
      const entities = result.mainEntity as Array<Record<string, unknown>>;
      expect(entities).toHaveLength(2);
      expect(entities[0]!["@type"]).toBe("Question");
    });
  });

  describe("Product", () => {
    it("generates Product schema", () => {
      const page = {
        path: "/products/widget",
        title: "Widget",
        description: "A great widget",
        schemaProps: { sku: "W-001", brand: { "@type": "Brand", name: "Acme" } },
      };
      const result = generateJsonLd("Product", makeConfig(), page);
      expect(result["@type"]).toBe("Product");
      expect(result.name).toBe("Widget");
      expect(result.sku).toBe("W-001");
    });
  });

  describe("BreadcrumbList", () => {
    it("generates breadcrumbs for nested page", () => {
      const page = { path: "/blog/post", title: "My Post", description: "A post" };
      const result = generateJsonLd("BreadcrumbList", makeConfig(), page);
      expect(result["@type"]).toBe("BreadcrumbList");
      const items = result.itemListElement as Array<Record<string, unknown>>;
      expect(items).toHaveLength(3); // Home > Blog > My Post
      expect(items[0]!.name).toBe("Home");
      expect(items[1]!.name).toBe("Blog");
      expect(items[2]!.name).toBe("My Post");
    });

    it("generates single breadcrumb for home page", () => {
      const page = { path: "/", title: "Home", description: "Welcome" };
      const result = generateJsonLd("BreadcrumbList", makeConfig(), page);
      const items = result.itemListElement as Array<Record<string, unknown>>;
      expect(items).toHaveLength(1);
    });

    it("capitalizes breadcrumb names correctly", () => {
      const page = { path: "/my-category/sub-item", title: "Sub Item", description: "Desc" };
      const result = generateJsonLd("BreadcrumbList", makeConfig(), page);
      const items = result.itemListElement as Array<Record<string, unknown>>;
      expect(items[1]!.name).toBe("My category"); // capitalize logic check
      expect(items[2]!.name).toBe("Sub Item"); // page title used for last item
    });
  });
});
