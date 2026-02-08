import type { Rule, PageData, RuleResult } from "../types.js";

/** R12: Check Content-Type header and compression */
export const r12ContentType: Rule = {
  id: "R12",
  name: "Content-Type & Encoding",
  description: "Verify proper content-type header and compression",
  category: "technical",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const contentType = page.headers["content-type"] ?? "";
    const encoding = page.headers["content-encoding"] ?? "";

    const isHtml = contentType.includes("text/html");
    const hasCharset =
      contentType.includes("charset=") || contentType.includes("utf-8");
    const hasCompression =
      encoding.includes("gzip") ||
      encoding.includes("br") ||
      encoding.includes("deflate");

    if (!isHtml) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: `Wrong content-type: ${contentType || "(none)"}`,
        recommendation: "Ensure your server returns Content-Type: text/html; charset=utf-8",
        details: { contentType, encoding },
      };
    }

    const issues: string[] = [];
    let score = 5;

    if (!hasCharset) {
      issues.push("missing charset");
      score -= 1;
    }
    if (!hasCompression) {
      issues.push("no compression (gzip/brotli)");
      score -= 2;
    }

    if (issues.length > 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score,
        maxScore: this.maxScore,
        message: `Content-type OK but ${issues.join(", ")}`,
        recommendation: issues.includes("no compression")
          ? "Enable gzip or brotli compression to reduce payload size for AI crawlers."
          : "Add charset=utf-8 to your Content-Type header.",
        details: { contentType, encoding },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 5,
      maxScore: this.maxScore,
      message: "Proper content-type with compression",
      details: { contentType, encoding },
    };
  },
};
