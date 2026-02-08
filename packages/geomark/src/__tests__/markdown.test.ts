import { describe, it, expect } from "vitest";
import { htmlToMarkdown, generateFrontmatter } from "../markdown.js";

describe("htmlToMarkdown", () => {
  it("converts headings", () => {
    const result = htmlToMarkdown("<h1>Title</h1><h2>Subtitle</h2>");
    expect(result).toContain("# Title");
    expect(result).toContain("## Subtitle");
  });

  it("converts links", () => {
    const result = htmlToMarkdown('<a href="https://example.com">Link</a>');
    expect(result).toContain("[Link](https://example.com)");
  });

  it("converts images", () => {
    const result = htmlToMarkdown('<img src="https://example.com/img.png" alt="Photo">');
    expect(result).toContain("![Photo](https://example.com/img.png)");
  });

  it("converts unordered lists", () => {
    const result = htmlToMarkdown("<ul><li>Item 1</li><li>Item 2</li></ul>");
    expect(result).toMatch(/-\s+Item 1/);
    expect(result).toMatch(/-\s+Item 2/);
  });

  it("converts bold and italic text", () => {
    const result = htmlToMarkdown("<p><strong>bold</strong> and <em>italic</em></p>");
    expect(result).toContain("**bold**");
    expect(result).toContain("*italic*");
  });

  it("converts code blocks", () => {
    const result = htmlToMarkdown("<pre><code>const x = 1;</code></pre>");
    expect(result).toContain("```");
    expect(result).toContain("const x = 1;");
  });

  it("removes script tags", () => {
    const result = htmlToMarkdown("<p>Text</p><script>alert(1)</script>");
    expect(result).not.toContain("alert");
    expect(result).toContain("Text");
  });

  it("removes style tags", () => {
    const result = htmlToMarkdown("<p>Text</p><style>.x{color:red}</style>");
    expect(result).not.toContain("color:red");
  });

  it("removes tracking pixels", () => {
    const result = htmlToMarkdown('<p>Text</p><img src="https://track.com/pixel.gif" width="1" height="1">');
    expect(result).not.toContain("pixel");
  });

  it("collapses excessive blank lines", () => {
    const result = htmlToMarkdown("<p>A</p><br><br><br><br><p>B</p>");
    const blankLineCount = (result.match(/\n{3,}/g) ?? []).length;
    expect(blankLineCount).toBe(0);
  });

  it("handles empty input", () => {
    const result = htmlToMarkdown("");
    expect(result).toBe("");
  });
});

describe("generateFrontmatter", () => {
  it("generates valid YAML frontmatter", () => {
    const result = generateFrontmatter({ title: "Test", url: "https://example.com" });
    expect(result).toContain("---");
    expect(result.startsWith("---")).toBe(true);
    expect(result.endsWith("---")).toBe(true);
  });

  it("includes all provided fields", () => {
    const result = generateFrontmatter({ title: "Test", author: "Jane", tokens: 1500 });
    expect(result).toContain("title:");
    expect(result).toContain("author:");
    expect(result).toContain("tokens:");
  });

  it("skips empty values", () => {
    const result = generateFrontmatter({ title: "Test", author: "" });
    expect(result).not.toContain("author:");
  });

  it("escapes special characters in values", () => {
    const result = generateFrontmatter({ title: 'He said "hello"' });
    expect(result).toContain('\\"');
  });
});
