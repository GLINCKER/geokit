import { describe, it, expect } from "vitest";
import { r11ResponseTime } from "../rules/r11-response-time.js";
import { mockPage } from "./helpers.js";

describe("R11: Response Time", () => {
  it("passes with fast TTFB", () => {
    const page = mockPage({ ttfb: 150 });
    const result = r11ResponseTime.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
  });

  it("warns with moderate TTFB", () => {
    const page = mockPage({ ttfb: 1000 });
    const result = r11ResponseTime.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(10);
  });

  it("fails with slow TTFB", () => {
    const page = mockPage({ ttfb: 3000 });
    const result = r11ResponseTime.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("reports exact TTFB in ms", () => {
    const page = mockPage({ ttfb: 230 });
    const result = r11ResponseTime.check(page);
    expect(result.message).toContain("230ms");
  });
});
