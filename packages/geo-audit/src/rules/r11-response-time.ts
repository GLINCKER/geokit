import type { Rule, PageData, RuleResult } from "../types.js";

/** R11: Check response time (TTFB) */
export const r11ResponseTime: Rule = {
  id: "R11",
  name: "Response Time",
  description: "Check Time to First Byte (TTFB) — AI crawlers have strict timeouts",
  category: "technical",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const ttfb = Math.round(page.ttfb);

    if (ttfb > 2000) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: `Slow TTFB: ${ttfb}ms (should be <500ms)`,
        recommendation:
          "Improve server response time. AI crawlers may skip slow sites. Consider caching, CDN, or server optimization.",
        details: { ttfb },
      };
    }

    if (ttfb > 500) {
      const score = Math.max(2, Math.round(10 - ((ttfb - 500) / 1500) * 8));
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score,
        maxScore: this.maxScore,
        message: `Moderate TTFB: ${ttfb}ms (target <500ms)`,
        recommendation:
          "Consider improving server response time for better AI crawler compatibility.",
        details: { ttfb },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 10,
      maxScore: this.maxScore,
      message: `Fast TTFB: ${ttfb}ms`,
      details: { ttfb },
    };
  },
};
