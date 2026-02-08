import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R08: Check heading hierarchy */
export const r08Headings: Rule = {
  id: "R08",
  name: "Heading Hierarchy",
  description: "Check for proper heading structure (single H1, no skipped levels)",
  category: "content-quality",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const headings: { level: number; text: string }[] = [];

    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const tag = $(el).prop("tagName")?.toLowerCase() ?? "";
      const level = parseInt(tag.replace("h", ""), 10);
      const text = $(el).text().trim();
      if (!isNaN(level)) {
        headings.push({ level, text });
      }
    });

    if (headings.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No headings found on page",
        recommendation: "Add an H1 heading and use proper heading hierarchy for AI content parsing.",
      };
    }

    const h1Count = headings.filter((h) => h.level === 1).length;
    const issues: string[] = [];

    if (h1Count === 0) {
      issues.push("No H1 heading found");
    } else if (h1Count > 1) {
      issues.push(`Multiple H1 headings (${h1Count})`);
    }

    // Check for skipped levels
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1]!.level;
      const curr = headings[i]!.level;
      if (curr > prev + 1) {
        issues.push(`Skipped from H${prev} to H${curr}`);
        break; // Only report first skip
      }
    }

    if (h1Count === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 2,
        maxScore: this.maxScore,
        message: issues.join("; "),
        recommendation: "Add a single H1 heading that describes your page content.",
        details: { h1Count, totalHeadings: headings.length, issues },
      };
    }

    if (issues.length > 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 5,
        maxScore: this.maxScore,
        message: issues.join("; "),
        recommendation: "Fix heading hierarchy: use a single H1 and don't skip levels (e.g., H1 → H3 without H2).",
        details: { h1Count, totalHeadings: headings.length, issues },
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
      message: `Proper heading hierarchy (${headings.length} headings)`,
      details: { h1Count, totalHeadings: headings.length },
    };
  },
};
