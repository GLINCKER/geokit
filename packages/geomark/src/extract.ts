import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import type { GeomarkOptions } from "./types.js";

const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_USER_AGENT =
  "GeoKit/0.1.0 (+https://geo.glincker.com; content extraction)";

/** Blocked IP ranges (SSRF prevention) */
const BLOCKED_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^localhost$/i,
  /^\[::1\]$/,
];

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(hostname));
}

/**
 * Fetch URL with SSRF protection and timeout.
 */
export async function fetchUrl(
  url: string,
  options: GeomarkOptions = {},
): Promise<{ html: string; finalUrl: string }> {
  const parsed = new URL(url);
  if (isBlockedHost(parsed.hostname)) {
    throw new Error(`Blocked: ${parsed.hostname} is a private/internal address`);
  }

  const controller = new AbortController();
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": options.userAgent ?? DEFAULT_USER_AGENT,
        Accept: "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    return { html, finalUrl: res.url };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract readable content from HTML using Mozilla Readability.
 */
export function extractContent(
  html: string,
  _url: string,
): { title: string; content: string } | null {
  const { document } = parseHTML(html);

  // linkedom's document is compatible with Readability's expected interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reader = new Readability(document as any, {
    charThreshold: 0,
  });
  const article = reader.parse();

  if (!article) {
    return null;
  }

  return {
    title: article.title,
    content: article.content,
  };
}
