import type { FetchResult, PageData, AuditOptions } from "./types.js";

const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_USER_AGENT =
  "GeoKit/0.1.0 (+https://geo.glincker.com; AI-readiness audit)";


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

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

async function safeFetch(
  url: string,
  options: AuditOptions,
): Promise<Response> {
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
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchResource(
  url: string,
  options: AuditOptions,
): Promise<FetchResult> {
  try {
    const res = await safeFetch(url, options);
    const body = await res.text();
    return { ok: res.ok, status: res.status, body };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown fetch error";
    return { ok: false, status: 0, body: "", error: message };
  }
}

/** Fetch all page data needed for audit rules */
export async function fetchPageData(
  rawUrl: string,
  options: AuditOptions = {},
): Promise<PageData> {
  const url = normalizeUrl(rawUrl);
  const origin = new URL(url).origin;

  // Measure TTFB and total time for main page
  const startTime = performance.now();
  let ttfb = 0;

  const mainRes = await safeFetch(url, options);
  ttfb = performance.now() - startTime;
  const html = await mainRes.text();
  const totalTime = performance.now() - startTime;

  // Extract headers
  const headers: Record<string, string> = {};
  mainRes.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  // Fetch auxiliary resources in parallel
  const [llmsTxt, robotsTxt, sitemapXml] = await Promise.all([
    fetchResource(`${origin}/llms.txt`, options),
    fetchResource(`${origin}/robots.txt`, options),
    fetchResource(`${origin}/sitemap.xml`, options),
  ]);

  return {
    url,
    html,
    statusCode: mainRes.status,
    headers,
    ttfb,
    totalTime,
    llmsTxt,
    robotsTxt,
    sitemapXml,
  };
}
