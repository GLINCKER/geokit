import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R07: Check for canonical URL */
export const r07Canonical: Rule = {
  id: "R07",
  name: "Canonical URL",
  description: "Check for link rel=canonical with absolute URL",
  category: "structured-data",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const el = $('link[rel="canonical"]');
    const href = el.attr("href")?.trim() ?? "";

    if (!href) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No canonical URL found",
        recommendation:
          'Add <link rel="canonical" href="https://..."> to prevent duplicate content issues with AI crawlers.',
      };
    }

    // Check if absolute URL
    const isAbsolute = /^https?:\/\//i.test(href);
    if (!isAbsolute) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: "Canonical URL is relative, should be absolute",
        recommendation: "Use an absolute URL (starting with https://) for the canonical link.",
        details: { canonical: href },
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
      message: "Canonical URL present",
      details: { canonical: href },
    };
  },
};
