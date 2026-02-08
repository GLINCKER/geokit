import { describe, it, expect } from "vitest";
import { getFixSuggestion } from "../fixes.js";

describe("getFixSuggestion", () => {
  it("returns llms-txt command for R01", () => {
    const fix = getFixSuggestion("R01");
    expect(fix).toBeDefined();
    expect(fix!.command).toContain("llms-txt");
    expect(fix!.automatic).toBe(true);
  });

  it("returns robots-txt command for R02", () => {
    const fix = getFixSuggestion("R02");
    expect(fix).toBeDefined();
    expect(fix!.command).toContain("robots-txt");
    expect(fix!.automatic).toBe(true);
  });

  it("returns sitemap command for R03", () => {
    const fix = getFixSuggestion("R03");
    expect(fix).toBeDefined();
    expect(fix!.command).toContain("sitemap");
    expect(fix!.automatic).toBe(true);
  });

  it("returns non-automatic fix for R04 (JSON-LD)", () => {
    const fix = getFixSuggestion("R04");
    expect(fix).toBeDefined();
    expect(fix!.command).toContain("geo-seo generate");
    expect(fix!.automatic).toBe(false);
  });

  it("returns non-automatic fix for R17 (identity schema)", () => {
    const fix = getFixSuggestion("R17");
    expect(fix).toBeDefined();
    expect(fix!.automatic).toBe(false);
  });

  it("returns undefined for rules without fixes", () => {
    expect(getFixSuggestion("R05")).toBeUndefined();
    expect(getFixSuggestion("R08")).toBeUndefined();
    expect(getFixSuggestion("R99")).toBeUndefined();
  });
});
