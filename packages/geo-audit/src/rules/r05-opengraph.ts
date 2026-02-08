import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

const CORE_OG_TAGS = ["og:title", "og:description", "og:image", "og:type"];

/** R05: Check for OpenGraph meta tags */
export const r05OpenGraph: Rule = {
  id: "R05",
  name: "OpenGraph Tags",
  description: "Check for core OpenGraph meta tags (title, description, image, type)",
  category: "structured-data",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const found: string[] = [];
    const missing: string[] = [];

    for (const tag of CORE_OG_TAGS) {
      const el = $(`meta[property="${tag}"]`);
      if (el.length > 0 && el.attr("content")?.trim()) {
        found.push(tag);
      } else {
        missing.push(tag);
      }
    }

    if (found.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No OpenGraph tags found",
        recommendation:
          "Add og:title, og:description, og:image, and og:type meta tags for better AI and social sharing.",
        details: { found, missing },
      };
    }

    if (missing.length > 0) {
      const score = Math.round((found.length / CORE_OG_TAGS.length) * this.maxScore);
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score,
        maxScore: this.maxScore,
        message: `Missing OpenGraph tags: ${missing.join(", ")}`,
        recommendation: `Add missing tags: ${missing.join(", ")}`,
        details: { found, missing },
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
      message: "All 4 core OpenGraph tags present",
      details: { found },
    };
  },
};
