import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { geomark } from "../geomark.js";

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("geomark integration", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes a full page correctly", async () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Article</title>
          <meta name="description" content="A test description">
          <meta property="og:site_name" content="Test Site">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "Test Article",
              "author": { "@type": "Person", "name": "John Doe" }
            }
          </script>
        </head>
        <body>
          <header>Header</header>
          <main>
            <article>
              <h1>Test Article</h1>
              <p>This is the first paragraph. It has some <strong>bold</strong> text.</p>
              <img src="image.jpg" alt="An image">
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
              <pre><code>console.log('code');</code></pre>
            </article>
          </main>
          <footer>Footer</footer>
        </body>
      </html>
    `;

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      url: "https://example.com/article",
      text: () => Promise.resolve(html),
    });

    const result = await geomark("https://example.com/article");

    expect(result.url).toBe("https://example.com/article");
    expect(result.title).toBe("Test Article");
    expect(result.markdown).toContain("This is the first paragraph");
    expect(result.markdown).toContain("List item 1");
    
    // Metadata
    expect(result.metadata.title).toBe("Test Article");
    expect(result.metadata.description).toBe("A test description");
    expect(result.metadata.siteName).toBe("Test Site");
    expect(result.metadata.author).toEqual({ "@type": "Person", "name": "John Doe" });
    
    // Stats
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.tokens).toBeGreaterThan(0);
  });

  it("handles fetch errors", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(geomark("https://example.com/404")).rejects.toThrow("HTTP 404");
  });

  it("falls back to full HTML conversion when readability fails", async () => {
    const html = `<html><body><p>Short content.</p></body></html>`;
    
    // Readability usually requires ~100+ chars or multiple paragraphs.
    // If it fails, geomark uses raw HTML -> markdown.

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      url: "https://example.com/short",
      text: () => Promise.resolve(html),
    });

    const result = await geomark("https://example.com/short");
    expect(result.markdown).toContain("Short content");
  });

  it("normalizes URL protocol", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      url: "https://example.com/normalized",
      text: () => Promise.resolve("<html>Content</html>"),
    });

    await geomark("example.com/normalized");
    
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/example\.com\/normalized/),
      expect.anything()
    );
  });
});
