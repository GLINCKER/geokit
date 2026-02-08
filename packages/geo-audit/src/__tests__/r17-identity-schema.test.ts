import { describe, it, expect } from "vitest";
import { r17IdentitySchema } from "../rules/r17-identity-schema.js";
import { mockPage } from "./helpers.js";

describe("R17: Identity Schema Detection", () => {
  it("passes when Organization schema is found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Example Corp"
  }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("Organization");
  });

  it("passes when Person schema is found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "John Doe"
  }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("Person");
  });

  it("passes when LocalBusiness schema is found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Local Shop"
  }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("LocalBusiness");
  });

  it("passes when identity schema is in @graph", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Home"
      },
      {
        "@type": "Organization",
        "name": "Example Corp"
      }
    ]
  }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("warns when JSON-LD exists but no identity schema", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Home Page"
  }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
    expect(result.message).toContain("no identity schema");
  });

  it("fails when no JSON-LD found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("No JSON-LD found");
  });

  it("handles malformed JSON-LD gracefully", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  { invalid json }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("passes with multiple identity types", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": "Example Business"
  }
  </script>
</head>
<body></body>
</html>`,
    });
    const result = r17IdentitySchema.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });
});
