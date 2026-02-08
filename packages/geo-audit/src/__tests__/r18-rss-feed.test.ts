import { describe, it, expect } from "vitest";
import { r18RssFeed } from "../rules/r18-rss-feed.js";
import { mockPage } from "./helpers.js";

describe("R18: RSS/Atom Feed Detection", () => {
  it("passes when RSS feed link is found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="RSS Feed">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("RSS");
  });

  it("passes when Atom feed link is found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" type="application/atom+xml" href="/atom.xml" title="Atom Feed">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("Atom");
  });

  it("passes with multiple feed types", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="RSS Feed">
  <link rel="alternate" type="application/atom+xml" href="/atom.xml" title="Atom Feed">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("RSS");
    expect(result.message).toContain("Atom");
  });

  it("passes with multiple RSS feeds", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="Main Feed">
  <link rel="alternate" type="application/rss+xml" href="/blog/feed.xml" title="Blog Feed">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.message).toContain("RSS (2)");
  });

  it("warns when feed link has wrong type", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" type="text/xml" href="/feed.xml">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
    expect(result.message).toContain("missing or incorrect type");
  });

  it("warns when feed link has no type attribute", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" href="/feed.xml">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
  });

  it("fails when no feed link found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("No feed link found");
  });

  it("fails when rel=alternate exists but for other purposes", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <link rel="alternate" hreflang="es" href="/es/">
</head>
<body></body>
</html>`,
    });
    const result = r18RssFeed.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
  });
});
