import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R10: Check for FAQ content and FAQ schema */
export const r10Faq: Rule = {
  id: "R10",
  name: "FAQ Content Detection",
  description: "Check for FAQ content and corresponding FAQ schema markup",
  category: "content-quality",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);

    // Detect FAQ-like content patterns
    const hasFaqHeading = /faq|frequently\s+asked|questions/i.test(page.html);
    const hasDlList = $("dl dt").length >= 2;
    const hasDetailsSummary = $("details summary").length >= 2;
    const hasAccordion =
      $('[class*="accordion"], [class*="faq"], [data-faq]').length > 0;

    const hasFaqContent =
      hasFaqHeading || hasDlList || hasDetailsSummary || hasAccordion;

    if (!hasFaqContent) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "skip",
        score: 5, // Full points if no FAQ content — not penalized
        maxScore: this.maxScore,
        message: "No FAQ content detected (not penalized)",
      };
    }

    // Check for FAQ schema
    let hasFaqSchema = false;
    $('script[type="application/ld+json"]').each((_, el) => {
      const text = $(el).text();
      try {
        const data = JSON.parse(text);
        const checkType = (obj: Record<string, unknown>): boolean => {
          if (obj["@type"] === "FAQPage" || obj["@type"] === "FAQ") return true;
          if (obj["@graph"] && Array.isArray(obj["@graph"])) {
            return obj["@graph"].some((item) =>
              checkType(item as Record<string, unknown>),
            );
          }
          return false;
        };
        if (checkType(data)) hasFaqSchema = true;
      } catch {
        // ignore parse errors
      }
    });

    if (!hasFaqSchema) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: "FAQ content detected but no FAQPage schema markup",
        recommendation:
          "Add FAQPage JSON-LD schema to your FAQ section — FAQ schema has the highest citation rate in AI-generated answers.",
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
      message: "FAQ content with FAQPage schema markup detected",
    };
  },
};
