import { describe, it, expect } from "vitest";
import { r25SchemaDepth } from "../rules/r25-schema-depth.js";
import { mockPage } from "./helpers.js";

describe("R25: Schema Depth", () => {
  it("skips when no JSON-LD found", () => {
    const html = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><p>Content</p></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.status).toBe("skip");
    expect(result.score).toBe(0);
  });

  it("warns with shallow schema (1 type, <5 props)", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example"
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
    expect(result.details?.types).toContain("Organization");
    expect(result.details?.totalProperties).toBeLessThan(5);
  });

  it("warns with moderate schema (1 type, 5-9 props)", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example",
    "description": "An example organization",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png",
    "telephone": "+1-555-1234",
    "email": "info@example.com"
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(4);
    expect(result.details?.totalProperties).toBeGreaterThanOrEqual(5);
    expect(result.details?.totalProperties).toBeLessThan(10);
  });

  it("passes with good schema (2+ types or 10+ props)", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example",
    "description": "Description",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png",
    "telephone": "+1-555-1234",
    "email": "info@example.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main St",
      "addressLocality": "City",
      "addressRegion": "State",
      "postalCode": "12345"
    }
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBeGreaterThanOrEqual(6);
    expect(result.details?.types.length).toBeGreaterThanOrEqual(2);
  });

  it("passes with rich schema (3+ types AND 10+ props AND 5+ key)", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Example Article",
    "description": "An example article",
    "image": "https://example.com/image.png",
    "datePublished": "2024-01-01",
    "dateModified": "2024-01-02",
    "author": {
      "@type": "Person",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Example Publisher",
      "logo": "https://example.com/logo.png",
      "url": "https://example.com"
    },
    "mainEntityOfPage": "https://example.com/article",
    "url": "https://example.com/article"
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(8);
    expect(result.details?.types.length).toBeGreaterThanOrEqual(3);
    expect(result.details?.totalProperties).toBeGreaterThanOrEqual(10);
    expect(result.details?.keyProperties.length).toBeGreaterThanOrEqual(5);
  });

  it("handles malformed JSON gracefully", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  { invalid json }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Valid"
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.status).toBe("warn");
    expect(result.details?.types).toContain("Organization");
  });

  it("handles multiple JSON-LD blocks", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example",
    "url": "https://example.com"
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article",
    "author": "John Doe"
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.details?.types).toContain("Organization");
    expect(result.details?.types).toContain("Article");
    expect(result.details?.types.length).toBe(2);
  });

  it("counts key properties correctly", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "name": "Title",
    "description": "Desc",
    "image": "img.png",
    "url": "https://example.com",
    "author": "John",
    "publisher": "Pub",
    "datePublished": "2024-01-01"
  }
  </script>
</head>
<body></body>
</html>`;
    const page = mockPage({ html });
    const result = r25SchemaDepth.check(page);
    expect(result.details?.keyProperties).toContain("name");
    expect(result.details?.keyProperties).toContain("description");
    expect(result.details?.keyProperties).toContain("image");
    expect(result.details?.keyProperties).toContain("url");
    expect(result.details?.keyProperties).toContain("author");
    expect(result.details?.keyProperties.length).toBeGreaterThanOrEqual(5);
  });
});
