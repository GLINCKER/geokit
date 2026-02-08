import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

const KNOWN_TYPES = [
  "Organization",
  "WebPage",
  "WebSite",
  "Article",
  "BlogPosting",
  "FAQ",
  "FAQPage",
  "Product",
  "LocalBusiness",
  "Person",
  "BreadcrumbList",
  "HowTo",
  "Event",
  "SoftwareApplication",
  "Course",
  "Recipe",
  "VideoObject",
];

/** R04: Check for JSON-LD Schema.org markup */
export const r04JsonLd: Rule = {
  id: "R04",
  name: "JSON-LD Schema.org Markup",
  description: "Check for structured data using JSON-LD format",
  category: "structured-data",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const scripts = $('script[type="application/ld+json"]');

    if (scripts.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No JSON-LD structured data found",
        recommendation:
          "Add JSON-LD Schema.org markup to help AI understand your page content. Start with Organization or WebPage schema.",
      };
    }

    const types: string[] = [];
    let hasErrors = false;

    scripts.each((_, el) => {
      const text = $(el).text();
      try {
        const data = JSON.parse(text);
        const extractType = (obj: Record<string, unknown>): void => {
          if (obj["@type"]) {
            const t = Array.isArray(obj["@type"])
              ? obj["@type"]
              : [obj["@type"]];
            types.push(...(t as string[]));
          }
          if (obj["@graph"] && Array.isArray(obj["@graph"])) {
            for (const item of obj["@graph"]) {
              extractType(item as Record<string, unknown>);
            }
          }
        };
        extractType(data);
      } catch {
        hasErrors = true;
      }
    });

    if (hasErrors && types.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: "JSON-LD found but contains parse errors",
        recommendation: "Fix JSON-LD syntax errors. Validate at https://search.google.com/test/rich-results",
        details: { types },
      };
    }

    const recognized = types.filter((t) => KNOWN_TYPES.includes(t));

    if (types.length > 0 && recognized.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 5,
        maxScore: this.maxScore,
        message: `JSON-LD found with unrecognized type(s): ${types.join(", ")}`,
        recommendation: "Use standard Schema.org types like Organization, WebPage, Article, or Product.",
        details: { types },
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
      message: `JSON-LD found: ${recognized.join(", ")}`,
      details: { types: recognized },
    };
  },
};
