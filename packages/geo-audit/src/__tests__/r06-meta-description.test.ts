import { describe, it, expect } from "vitest";
import { r06MetaDescription } from "../rules/r06-meta-description.js";
import { mockPage } from "./helpers.js";

describe("R06: Meta Description", () => {
  it("passes with proper length description", () => {
    const page = mockPage({
      html: '<html><head><meta name="description" content="This is a perfectly crafted meta description that falls well within the ideal range."></head><body><h1>Test</h1></body></html>',
    });
    const result = r06MetaDescription.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("warns when too short", () => {
    const page = mockPage({
      html: '<html><head><meta name="description" content="Too short"></head><body><h1>Test</h1></body></html>',
    });
    const result = r06MetaDescription.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
  });

  it("warns when too long", () => {
    const desc = "A".repeat(200);
    const page = mockPage({
      html: `<html><head><meta name="description" content="${desc}"></head><body><h1>Test</h1></body></html>`,
    });
    const result = r06MetaDescription.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
  });

  it("fails when missing", () => {
    const page = mockPage({
      html: "<html><head><title>No desc</title></head><body><h1>Test</h1></body></html>",
    });
    const result = r06MetaDescription.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
