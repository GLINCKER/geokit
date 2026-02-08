import { describe, it, expect } from "vitest";
import { r07Canonical } from "../rules/r07-canonical.js";
import { mockPage } from "./helpers.js";

describe("R07: Canonical URL", () => {
  it("passes with absolute canonical URL", () => {
    const page = mockPage({
      html: '<html><head><link rel="canonical" href="https://example.com/page"></head><body><h1>Test</h1></body></html>',
    });
    const result = r07Canonical.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("warns with relative canonical URL", () => {
    const page = mockPage({
      html: '<html><head><link rel="canonical" href="/page"></head><body><h1>Test</h1></body></html>',
    });
    const result = r07Canonical.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
  });

  it("fails when missing", () => {
    const page = mockPage({
      html: "<html><head><title>No canonical</title></head><body><h1>Test</h1></body></html>",
    });
    const result = r07Canonical.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
