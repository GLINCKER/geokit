import { describe, it, expect } from "vitest";
import { estimateTokens, countWords, estimateReadingTime } from "../tokens.js";

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates tokens for short text", () => {
    const result = estimateTokens("Hello world");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(10);
  });

  it("estimates tokens for longer text", () => {
    const text = "The quick brown fox jumps over the lazy dog. ".repeat(100);
    const result = estimateTokens(text);
    // ~900 words, should be ~1000-1500 tokens
    expect(result).toBeGreaterThan(500);
    expect(result).toBeLessThan(3000);
  });

  it("handles text with special characters", () => {
    const result = estimateTokens("function foo() { return 42; }");
    expect(result).toBeGreaterThan(0);
  });
});

describe("countWords", () => {
  it("returns 0 for empty string", () => {
    expect(countWords("")).toBe(0);
  });

  it("counts words correctly", () => {
    expect(countWords("Hello world")).toBe(2);
    expect(countWords("one two three four five")).toBe(5);
  });

  it("handles multiple spaces", () => {
    expect(countWords("hello    world")).toBe(2);
  });

  it("handles newlines", () => {
    expect(countWords("hello\nworld\nfoo")).toBe(3);
  });
});

describe("estimateReadingTime", () => {
  it("returns 0 for 0 words", () => {
    expect(estimateReadingTime(0)).toBe(0);
  });

  it("returns 1 minute for short text", () => {
    expect(estimateReadingTime(100)).toBe(1);
  });

  it("estimates reading time correctly", () => {
    // 238 words per minute
    expect(estimateReadingTime(476)).toBe(2);
    expect(estimateReadingTime(1190)).toBe(5);
  });
});
