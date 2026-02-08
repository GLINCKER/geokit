import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

const IDENTITY_TYPES = ["Organization", "Person", "LocalBusiness"];

/** R17: Check for identity schema in JSON-LD */
export const r17IdentitySchema: Rule = {
  id: "R17",
  name: "Identity Schema Detection",
  description: "Check for Organization, Person, or LocalBusiness schema in JSON-LD",
  category: "structured-data",
  maxScore: 5,

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
        message: "No JSON-LD found on page",
        recommendation:
          "Add JSON-LD with Organization, Person, or LocalBusiness schema to establish your identity for AI systems.",
      };
    }

    const types: string[] = [];
    let hasJsonLd = false;

    scripts.each((_, el) => {
      const text = $(el).text();
      try {
        const data = JSON.parse(text);
        hasJsonLd = true;

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
        // Ignore parse errors, just check what we can
      }
    });

    const identityTypes = types.filter((t) => IDENTITY_TYPES.includes(t));

    if (identityTypes.length > 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 5,
        maxScore: this.maxScore,
        message: `Identity schema found: ${identityTypes.join(", ")}`,
        details: { types: identityTypes },
      };
    }

    if (hasJsonLd) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: "JSON-LD exists but no identity schema found",
        recommendation:
          "Add Organization, Person, or LocalBusiness schema to help AI systems understand who you are.",
        details: { types },
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
      message: "No valid JSON-LD found",
      recommendation:
        "Add JSON-LD with Organization, Person, or LocalBusiness schema to establish your identity.",
    };
  },
};
