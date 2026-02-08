import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R20: Check for mobile viewport meta tag */
export const r20Viewport: Rule = {
  id: "R20",
  name: "Mobile Viewport Meta Tag",
  description: "Check for proper viewport meta tag for mobile responsiveness",
  category: "technical",
  maxScore: 3,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const viewport = $('meta[name="viewport"]');

    if (viewport.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No viewport meta tag found",
        recommendation:
          'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for proper mobile rendering.',
      };
    }

    const content = viewport.attr("content") || "";

    if (content.includes("width=device-width")) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 3,
        maxScore: this.maxScore,
        message: "Viewport meta tag properly configured",
        details: { content },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "warn",
      score: 1,
      maxScore: this.maxScore,
      message: "Viewport meta tag exists but missing width=device-width",
      recommendation:
        'Update viewport meta tag to include "width=device-width" for proper mobile responsiveness.',
      details: { content },
    };
  },
};
