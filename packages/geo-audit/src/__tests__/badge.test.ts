import { describe, it, expect } from "vitest";
import { formatBadge, gradeToColor } from "../badge.js";
import type { AuditResult, Grade } from "../types.js";

function makeResult(score: number, grade: Grade, url: string): AuditResult {
  return {
    url,
    score,
    grade,
    categories: [],
    rules: [],
    recommendations: [],
    timestamp: new Date().toISOString(),
    duration: 100,
    version: "0.1.0",
  };
}

describe("gradeToColor", () => {
  it("maps A to brightgreen", () => {
    expect(gradeToColor("A")).toBe("brightgreen");
  });

  it("maps B to green", () => {
    expect(gradeToColor("B")).toBe("green");
  });

  it("maps C to yellow", () => {
    expect(gradeToColor("C")).toBe("yellow");
  });

  it("maps D to orange", () => {
    expect(gradeToColor("D")).toBe("orange");
  });

  it("maps F to red", () => {
    expect(gradeToColor("F")).toBe("red");
  });
});

describe("formatBadge", () => {
  it("generates correct static badge URL", () => {
    const result = makeResult(85, "A", "https://stripe.com");
    const badge = formatBadge(result);

    expect(badge.static).toBe(
      "https://img.shields.io/badge/AI--Ready-85%20(A)-brightgreen"
    );
  });

  it("generates dynamic badge URL with encoded worker endpoint", () => {
    const result = makeResult(72, "C", "https://example.com");
    const badge = formatBadge(result);

    expect(badge.dynamic).toContain("img.shields.io/endpoint?url=");
    expect(badge.dynamic).toContain(
      encodeURIComponent("https://geo-badge.glincker.workers.dev/?url=example.com")
    );
  });

  it("generates HTML img tag with alt text", () => {
    const result = makeResult(50, "D", "https://slow-site.com");
    const badge = formatBadge(result);

    expect(badge.html).toContain('<img alt="AI-Ready: 50 (D)"');
    expect(badge.html).toContain("orange");
    expect(badge.html).toContain("geo.glincker.com");
  });

  it("extracts hostname from full URL with path", () => {
    const result = makeResult(90, "A", "https://docs.stripe.com/api/charges");
    const badge = formatBadge(result);

    expect(badge.dynamic).toContain("docs.stripe.com");
    expect(badge.dynamic).not.toContain("/api/charges");
  });

  it("handles URL without protocol", () => {
    const result = makeResult(60, "C", "example.com");
    const badge = formatBadge(result);

    expect(badge.dynamic).toContain("example.com");
  });

  it("uses F grade with red color", () => {
    const result = makeResult(20, "F", "https://bad-site.com");
    const badge = formatBadge(result);

    expect(badge.static).toContain("red");
  });

  it("encodes score and grade in static URL", () => {
    const result = makeResult(75, "B", "https://test.com");
    const badge = formatBadge(result);

    expect(badge.static).toContain("75%20(B)");
    expect(badge.static).toContain("green");
  });
});
