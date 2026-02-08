import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R06: Check for meta description */
export const r06MetaDescription: Rule = {
  id: "R06",
  name: "Meta Description",
  description: "Check for meta description tag with appropriate length",
  category: "structured-data",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const el = $('meta[name="description"]');
    const content = el.attr("content")?.trim() ?? "";

    if (!content) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No meta description found",
        recommendation: "Add a meta description (50-160 characters) to summarize your page content.",
      };
    }

    const len = content.length;

    if (len < 50) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: `Meta description too short (${len} chars, min 50)`,
        recommendation: "Expand your meta description to at least 50 characters for better AI comprehension.",
        details: { length: len },
      };
    }

    if (len > 160) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `Meta description too long (${len} chars, max 160)`,
        recommendation: "Shorten your meta description to 160 characters or less.",
        details: { length: len },
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
      message: `Meta description present (${len} chars)`,
      details: { length: len },
    };
  },
};
