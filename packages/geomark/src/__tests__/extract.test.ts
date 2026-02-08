import { describe, it, expect } from "vitest";
import { extractContent } from "../extract.js";

describe("extractContent", () => {
  it("extracts article content", () => {
    const html = `<html><head><title>Test</title></head><body>
      <article>
        <h1>Article Title</h1>
        <p>This is the main content of the article. It has enough text to be detected as the main content by the readability algorithm. We need several sentences here to make sure the content is long enough to be extracted properly by Mozilla Readability.</p>
        <p>Here is another paragraph with more content to ensure readability picks it up. The algorithm needs a minimum amount of text to work correctly with content extraction.</p>
      </article>
      <nav><a href="/">Home</a><a href="/about">About</a></nav>
      <footer>Copyright 2025</footer>
    </body></html>`;

    const result = extractContent(html, "https://example.com");
    expect(result).not.toBeNull();
    expect(result!.content).toContain("main content");
  });

  it("returns title from content", () => {
    const html = `<html><head><title>Page Title</title></head><body>
      <article>
        <h1>Article Title</h1>
        <p>This is the main content of the article. It has enough text to be detected as the main content by the readability algorithm. We need several sentences here.</p>
        <p>More content for the readability algorithm to properly extract the article body text from the page.</p>
      </article>
    </body></html>`;

    const result = extractContent(html, "https://example.com");
    expect(result).not.toBeNull();
    expect(result!.title).toBeTruthy();
  });

  it("handles HTML with minimal content gracefully", () => {
    const html = `<html><head></head><body><p>Short</p></body></html>`;
    // Readability may return null for very short content
    const result = extractContent(html, "https://example.com");
    // Either null or has content - both are valid
    if (result) {
      expect(result.content).toBeTruthy();
    }
  });
});
