import type { GeomarkOptions, GeomarkResult } from "./types.js";
import { fetchUrl, extractContent } from "./extract.js";
import { extractMetadata } from "./metadata.js";
import { htmlToMarkdown } from "./markdown.js";
import { estimateTokens, countWords, estimateReadingTime } from "./tokens.js";

/**
 * Fetch a URL, extract readable content, and convert to markdown.
 */
export async function geomark(
  url: string,
  options: GeomarkOptions = {},
): Promise<GeomarkResult> {
  const { estimateTokens: doTokens = true } = options;

  // Normalize URL
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Fetch page
  const { html, finalUrl } = await fetchUrl(normalizedUrl, options);

  // Extract metadata
  const metadata = extractMetadata(html);

  // Extract readable content via Readability
  const extracted = extractContent(html, finalUrl);

  let markdown: string;
  let title: string;

  if (extracted) {
    markdown = htmlToMarkdown(extracted.content);
    title = extracted.title || metadata.title;
  } else {
    // Fallback: convert full HTML to markdown
    markdown = htmlToMarkdown(html);
    title = metadata.title;
  }

  // Token estimation
  const wordCount = countWords(markdown);
  const tokens = doTokens ? estimateTokens(markdown) : 0;
  const readingTime = estimateReadingTime(wordCount);

  return {
    url: finalUrl,
    title,
    markdown,
    metadata,
    tokens,
    wordCount,
    readingTime,
    fetchedAt: new Date().toISOString(),
  };
}
