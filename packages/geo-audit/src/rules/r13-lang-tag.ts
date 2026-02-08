import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R13: Check for language tag on html element */
export const r13LangTag: Rule = {
  id: "R13",
  name: "Language Tag",
  description: "Check for lang attribute on <html> element for accessibility and i18n",
  category: "content-quality",
  maxScore: 3,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const htmlEl = $("html");
    const langAttr = htmlEl.attr("lang");

    if (!langAttr || langAttr.trim() === "") {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No lang attribute found on <html> element",
        recommendation:
          'Add lang attribute to <html> element (e.g., <html lang="en">) for accessibility and search engines.',
      };
    }

    // Basic validation of BCP-47 format (e.g., "en", "en-US", "de-DE")
    const validLangPattern = /^[a-z]{2,3}(-[A-Z]{2})?$/;
    if (!validLangPattern.test(langAttr.trim())) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 1,
        maxScore: this.maxScore,
        message: `Lang attribute present but may be invalid: "${langAttr}"`,
        recommendation:
          'Ensure lang attribute uses valid BCP-47 language code (e.g., "en", "en-US", "de").',
        details: { langCode: langAttr },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 3,
      maxScore: this.maxScore,
      message: `Valid lang attribute: "${langAttr}"`,
      details: { langCode: langAttr },
    };
  },
};
