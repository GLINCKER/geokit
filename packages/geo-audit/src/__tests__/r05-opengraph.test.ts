import { describe, it, expect } from "vitest";
import { r05OpenGraph } from "../rules/r05-opengraph.js";
import { mockPage } from "./helpers.js";

describe("R05: OpenGraph Tags", () => {
  it("passes with all 4 core OG tags", () => {
    const page = mockPage({
      html: `<html><head>
        <meta property="og:title" content="Test">
        <meta property="og:description" content="Desc">
        <meta property="og:image" content="https://example.com/img.png">
        <meta property="og:type" content="website">
      </head><body><h1>Test</h1></body></html>`,
    });
    const result = r05OpenGraph.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
  });

  it("warns with partial OG tags", () => {
    const page = mockPage({
      html: `<html><head>
        <meta property="og:title" content="Test">
        <meta property="og:description" content="Desc">
      </head><body><h1>Test</h1></body></html>`,
    });
    const result = r05OpenGraph.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5); // 2/4 = 50% of 10
    expect(result.details?.missing).toContain("og:image");
    expect(result.details?.missing).toContain("og:type");
  });

  it("fails with no OG tags", () => {
    const page = mockPage({
      html: "<html><head><title>No OG</title></head><body><h1>Test</h1></body></html>",
    });
    const result = r05OpenGraph.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("ignores empty content attributes", () => {
    const page = mockPage({
      html: `<html><head>
        <meta property="og:title" content="">
        <meta property="og:description" content="Real desc">
      </head><body><h1>Test</h1></body></html>`,
    });
    const result = r05OpenGraph.check(page);
    expect(result.status).toBe("warn");
    expect(result.details?.found).not.toContain("og:title");
  });
});
