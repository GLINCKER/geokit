import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

const SKIP_SELECTORS = [
  "nav",
  "header",
  "footer",
  "[role='navigation']",
  "[role='banner']",
  "[role='contentinfo']",
  ".cookie-banner",
  ".cookie-consent",
  "#cookie-notice",
  ".nav",
  ".navbar",
  ".sidebar",
  "aside",
].join(",");

const FILLER_PATTERNS = [
  /^welcome\s+to/i,
  /^click\s+here/i,
  /^sign\s+up/i,
  /^subscribe/i,
  /^cookie/i,
  /^we\s+use\s+cookies/i,
  /^this\s+website\s+uses/i,
  /^accept\s+(all\s+)?cookies/i,
  /^skip\s+to\s+(main\s+)?content/i,
  /^toggle\s+navigation/i,
  /^menu/i,
  /^loading/i,
  /^please\s+enable\s+javascript/i,
];

/** R24: Check if page leads with a direct answer (BLUF) */
export const r24Bluf: Rule = {
  id: "R24",
  name: "BLUF / Answer Capsule",
  description: "Check if page leads with a direct answer",
  category: "content-quality",
  maxScore: 8,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);

    // Remove skip selectors
    $(SKIP_SELECTORS).remove();

    // Find first paragraph using various selectors
    const selectors = ["main p", "article p", "[role='main'] p", "body p"];
    let firstParagraph = "";

    for (const selector of selectors) {
      const $p = $(selector).first();
      if ($p.length > 0) {
        firstParagraph = $p.text().trim();
        if (firstParagraph) break;
      }
    }

    if (!firstParagraph) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No content paragraphs found",
        recommendation:
          "Add a direct answer or summary at the start of your main content",
      };
    }

    // Check for filler patterns
    const isFiller = FILLER_PATTERNS.some((pattern) =>
      pattern.test(firstParagraph),
    );

    if (isFiller) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: "First paragraph is filler content",
        recommendation:
          "Replace filler/boilerplate with a direct answer to the user's likely question",
        details: {
          preview: firstParagraph.slice(0, 120),
        },
      };
    }

    const words = firstParagraph.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    if (wordCount < 15) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `First paragraph is too short (${wordCount} words)`,
        recommendation:
          "Expand the opening to a more substantive answer (15-300 words)",
        details: {
          wordCount,
          preview: firstParagraph.slice(0, 120),
        },
      };
    }

    if (wordCount > 300) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 4,
        maxScore: this.maxScore,
        message: `First paragraph is too long (${wordCount} words)`,
        recommendation:
          "Shorten the opening to a more concise answer (15-300 words)",
        details: {
          wordCount,
          preview: firstParagraph.slice(0, 120),
        },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 8,
      maxScore: this.maxScore,
      message: `Page opens with substantive answer (${wordCount} words)`,
      details: {
        wordCount,
        preview: firstParagraph.slice(0, 120),
      },
    };
  },
};
