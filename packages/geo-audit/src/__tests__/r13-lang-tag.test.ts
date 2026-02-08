import { describe, it, expect } from "vitest";
import { r13LangTag } from "../rules/r13-lang-tag.js";
import { mockPage } from "./helpers.js";

describe("R13: Language Tag", () => {
  it("passes when valid lang attribute exists", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
    expect(result.details?.langCode).toBe("en");
  });

  it("passes with lang attribute with region code", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html lang="en-US"><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
    expect(result.details?.langCode).toBe("en-US");
  });

  it("passes with German lang code", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html lang="de"><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });

  it("warns when lang attribute is invalid format", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html lang="english"><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(1);
  });

  it("fails when lang attribute is missing", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("fails when lang attribute is empty", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html lang=""><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("fails when lang attribute is only whitespace", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html lang="   "><head><title>Test</title></head><body></body></html>`,
    });
    const result = r13LangTag.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
