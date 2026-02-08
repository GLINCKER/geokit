import type { PageData, FetchResult } from "../types.js";

/** Create a mock FetchResult */
export function mockFetch(overrides: Partial<FetchResult> = {}): FetchResult {
  return {
    ok: true,
    status: 200,
    body: "",
    ...overrides,
  };
}

/** Create a mock PageData with sensible defaults */
export function mockPage(overrides: Partial<PageData> = {}): PageData {
  return {
    url: "https://example.com",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Example Site</title>
  <meta name="description" content="A well-crafted description that is between 50 and 160 characters long for testing purposes.">
  <link rel="canonical" href="https://example.com">
  <meta property="og:title" content="Example Site">
  <meta property="og:description" content="Example description">
  <meta property="og:image" content="https://example.com/image.png">
  <meta property="og:type" content="website">
  <script type="application/ld+json">{"@type":"Organization","name":"Example"}</script>
</head>
<body>
  <h1>Example Site</h1>
  <h2>About Us</h2>
  <p>${"Lorem ipsum dolor sit amet. ".repeat(30)}</p>
  <h2>Services</h2>
  <p>${"Consectetur adipiscing elit. ".repeat(20)}</p>
</body>
</html>`,
    statusCode: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-encoding": "gzip",
    },
    ttfb: 150,
    totalTime: 300,
    llmsTxt: mockFetch({ ok: true, status: 200, body: "# Example\n\nSite description" }),
    robotsTxt: mockFetch({
      ok: true,
      status: 200,
      body: "User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n",
    }),
    sitemapXml: mockFetch({
      ok: true,
      status: 200,
      body: '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com</loc></url></urlset>',
    }),
    ...overrides,
  };
}
