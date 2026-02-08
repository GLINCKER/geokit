import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R16: Check for semantic HTML5 elements */
export const r16SemanticHtml: Rule = {
  id: "R16",
  name: "Semantic HTML",
  description: "Check for semantic HTML5 elements (main, article, section, nav, etc.)",
  category: "content-quality",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const semanticElements = [
      "main",
      "article",
      "section",
      "nav",
      "aside",
      "header",
      "footer",
    ];

    const foundElements = new Set<string>();
    semanticElements.forEach((tag) => {
      if ($(tag).length > 0) {
        foundElements.add(tag);
      }
    });

    const count = foundElements.size;
    const elementList = Array.from(foundElements).sort().join(", ");

    if (count >= 3) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 5,
        maxScore: this.maxScore,
        message: `Good use of semantic HTML: ${elementList}`,
        details: { semanticElements: Array.from(foundElements), count },
      };
    }

    if (count >= 1) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `Limited semantic HTML: ${elementList || "none"}`,
        recommendation:
          "Use more semantic HTML5 elements (main, article, section, nav, aside, header, footer) to improve content structure for AI parsing and accessibility.",
        details: { semanticElements: Array.from(foundElements), count },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "fail",
      score: 0,
      maxScore: this.maxScore,
      message: "No semantic HTML5 elements found",
      recommendation:
        "Replace generic <div> elements with semantic HTML5 elements like <main>, <article>, <section>, <nav>, <header>, and <footer> to help AI systems understand your content structure.",
      details: { semanticElements: [], count: 0 },
    };
  },
};
