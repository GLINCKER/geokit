import { describe, it, expect } from "vitest";
import { r08Headings } from "../rules/r08-headings.js"; // Uses cheerio
import { r09SsrContent } from "../rules/r09-ssr-content.js"; // Uses raw text parsing
import { mockPage } from "./helpers.js";

const isCI = !!process.env.CI;

describe.skipIf(isCI)("Performance Check", () => {
  it("handles 5MB HTML within 2 seconds", async () => {
    const filler = "a".repeat(1024); // 1KB
    const mbFiller = filler.repeat(1024); // 1MB
    const fiveMB = mbFiller.repeat(5); // 5MB
    
    // Construct HTML efficiently
    const html = `<html><body><h1>Test</h1><p>${fiveMB}</p></body></html>`;
    
    const page = mockPage({
      html,
    });
    
    const start = performance.now();
    
    // Run two rules: one cheerio-heavy (headings), one text-scanning (SSR)
    const res1 = await r08Headings.check(page);
    const res2 = r09SsrContent.check(page);
    
    const duration = performance.now() - start;
    
    expect(res1).toBeDefined();
    expect(res2).toBeDefined();
    expect(duration).toBeLessThan(2000); // 2000ms = 2s
    
    // Also check memory usage if possible (Vitest might expose process.memoryUsage())
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;
    // This is total heap for test process, might be > 200MB if other tests ran.
    // But we can assert it's not absurdly high (e.g. < 500MB).
    expect(memory).toBeLessThan(500); 
  });
});
