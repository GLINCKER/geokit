import { describe, it, expect } from "vitest";
import { r14Https } from "../rules/r14-https.js";
import { mockPage } from "./helpers.js";

describe("R14: HTTPS Enforcement", () => {
  it("passes when URL uses HTTPS", () => {
    const page = mockPage({
      url: "https://example.com",
    });
    const result = r14Https.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
    expect(result.details?.protocol).toBe("https");
  });

  it("passes for HTTPS URL with subdomain", () => {
    const page = mockPage({
      url: "https://www.example.com/page",
    });
    const result = r14Https.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });

  it("passes for HTTPS URL with path and query", () => {
    const page = mockPage({
      url: "https://example.com/path?query=value",
    });
    const result = r14Https.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });

  it("fails when URL uses HTTP", () => {
    const page = mockPage({
      url: "http://example.com",
    });
    const result = r14Https.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.details?.protocol).toBe("http");
    expect(result.recommendation).toContain("HTTPS");
  });

  it("fails for HTTP URL with subdomain", () => {
    const page = mockPage({
      url: "http://www.example.com",
    });
    const result = r14Https.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("fails for HTTP URL with path", () => {
    const page = mockPage({
      url: "http://example.com/insecure/page",
    });
    const result = r14Https.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
