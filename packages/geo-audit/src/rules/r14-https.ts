import type { Rule, PageData, RuleResult } from "../types.js";

/** R14: Check if page is served over HTTPS */
export const r14Https: Rule = {
  id: "R14",
  name: "HTTPS Enforcement",
  description: "Verify that the page is served over secure HTTPS",
  category: "technical",
  maxScore: 3,

  check(page: PageData): RuleResult {
    const isHttps = page.url.startsWith("https://");

    if (!isHttps) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "Page is not served over HTTPS",
        recommendation:
          "Enable HTTPS for your site. This is critical for security, SEO, and user trust.",
        details: { protocol: "http" },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 3,
      maxScore: this.maxScore,
      message: "Page is served over HTTPS",
      details: { protocol: "https" },
    };
  },
};
