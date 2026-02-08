import { describe, it, expect } from "vitest";
import { geomark } from "../geomark.js";
import { htmlToMarkdown } from "../markdown.js";
import { estimateTokens } from "../tokens.js";
import { createServer } from "node:http";

describe("geomark performance tests", () => {
  it("handles a massive HTML string efficiently", async () => {
    // Generate 5MB of HTML
    const largeParagraph = "This is a test paragraph that repeats many times to create a large string for performance testing. ".repeat(100);
    const massiveHtml = `<html><body><article>${Array(600).fill(`<h2>Section</h2><p>${largeParagraph}</p>`).join("")}</article></body></html>`;
    
    expect(massiveHtml.length).toBeGreaterThan(5 * 1024 * 1024);
    
    const start = Date.now();
    const markdown = htmlToMarkdown(massiveHtml);
    const end = Date.now();
    
    const duration = end - start;
    console.log(`Markdown conversion of 5MB HTML took ${duration}ms`);
    
    expect(duration).toBeLessThan(2000); // Should be < 2s
    expect(markdown.length).toBeGreaterThan(1000000);
  });

  it("estimateTokens is fast for large strings", () => {
    const largeStr = "token ".repeat(100000); // ~100k words
    const start = Date.now();
    const tokens = estimateTokens(largeStr);
    const end = Date.now();
    
    const duration = end - start;
    console.log(`Token estimation for 100k words took ${duration}ms`);
    
    expect(duration).toBeLessThan(100); // Should be instant
    expect(tokens).toBeGreaterThan(100000);
  });
});
