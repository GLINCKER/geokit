import { describe, it, expect } from "vitest";
import { r19LlmsQuality } from "../rules/r19-llms-quality.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R19: llms.txt Content Quality", () => {
  it("passes with high-quality llms.txt (5/5 signals)", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Example Site

## About Us
We are a company that does great things. Our mission is to help people.

## Services
We offer [consulting](/consulting) and [training](/training) services.

## Contact
Find us at [example.com](https://example.com).
`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("High-quality");
  });

  it("passes with 4/5 quality signals", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Example Site

We are a company that does great things. Our mission is to help people and provide excellent service.

## Services
We offer consulting and training services. Visit [our site](https://example.com) for more details.

## Contact
Get in touch with us today.
`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("warns with 3/5 quality signals", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Example Site

We are a company that does great things. Our mission is to help people and provide excellent service.
`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.message).toContain("could be improved");
  });

  it("warns with 2/5 quality signals", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Example Site

This is a description that is long enough to meet the minimum character requirement of one hundred characters for quality.
`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
  });

  it("fails with only 1 quality signal", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Example`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(1);
    expect(result.message).toContain("Minimal");
  });

  it("fails with no quality signals", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `Just text`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(1);
  });

  it("skips when llms.txt does not exist", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ ok: false, status: 404, body: "" }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("skip");
    expect(result.score).toBe(5);
    expect(result.message).toContain("does not exist");
  });

  it("skips when llms.txt is empty", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ body: "" }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.status).toBe("skip");
    expect(result.score).toBe(5);
    expect(result.message).toContain("empty");
  });

  it("detects H1 heading correctly", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Site Title
Some content here that is long enough to meet the length requirement for quality scoring.`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.details?.signals).toContain("H1 heading");
  });

  it("detects sufficient length (100+ chars)", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `This is a test document with sufficient content to meet the minimum length requirement of one hundred characters.`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.details?.signals).toContain("sufficient length");
  });

  it("detects markdown links", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `Check out [our site](https://example.com)`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.details?.signals).toContain("contains links");
  });

  it("detects multiple sections (2+ H2 headings)", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Title
## Section 1
Content
## Section 2
More content`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.details?.signals).toContain("multiple sections");
  });

  it("detects descriptive content (3+ non-heading lines)", () => {
    const page = mockPage({
      llmsTxt: mockFetch({
        body: `# Title
Line 1
Line 2
Line 3
Line 4`,
      }),
    });
    const result = r19LlmsQuality.check(page);
    expect(result.details?.signals).toContain("descriptive content");
  });
});
