import { describe, it, expect } from "vitest";
import { r04JsonLd } from "../rules/r04-json-ld.js";
import { mockPage } from "./helpers.js";

describe("R04: JSON-LD Schema.org", () => {
  it("passes with valid JSON-LD", () => {
    const page = mockPage({
      html: '<html><head><script type="application/ld+json">{"@type":"Organization","name":"Test"}</script></head><body><h1>Test</h1></body></html>',
    });
    const result = r04JsonLd.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
    expect(result.details?.types).toContain("Organization");
  });

  it("handles @graph format", () => {
    const page = mockPage({
      html: `<html><head><script type="application/ld+json">{"@graph":[{"@type":"WebPage"},{"@type":"Organization"}]}</script></head><body><h1>Test</h1></body></html>`,
    });
    const result = r04JsonLd.check(page);
    expect(result.status).toBe("pass");
    expect(result.details?.types).toContain("WebPage");
    expect(result.details?.types).toContain("Organization");
  });

  it("warns on unrecognized type", () => {
    const page = mockPage({
      html: '<html><head><script type="application/ld+json">{"@type":"CustomThing"}</script></head><body><h1>Test</h1></body></html>',
    });
    const result = r04JsonLd.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("warns on invalid JSON", () => {
    const page = mockPage({
      html: '<html><head><script type="application/ld+json">{invalid json}</script></head><body><h1>Test</h1></body></html>',
    });
    const result = r04JsonLd.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
  });

  it("fails when no JSON-LD found", () => {
    const page = mockPage({
      html: "<html><head><title>No LD</title></head><body><h1>Test</h1></body></html>",
    });
    const result = r04JsonLd.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
