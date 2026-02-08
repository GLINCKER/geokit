import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R09: Check if meaningful content is in initial HTML (SSR) */
export const r09SsrContent: Rule = {
  id: "R09",
  name: "Content Accessibility (SSR)",
  description: "Check if meaningful content is available in initial HTML without JavaScript",
  category: "content-quality",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);

    // Remove script, style, noscript, nav, footer, header tags
    $("script, style, noscript, nav, footer, header, svg, iframe").remove();

    // Get visible text content from body
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const textLength = bodyText.length;

    if (textLength < 100) {
      // Check if it looks like a JS-only app
      const hasReactRoot =
        $('[id="root"], [id="app"], [id="__next"]').length > 0;
      const hasJsBundles = page.html.includes(".js") && textLength < 50;

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message:
          hasJsBundles || hasReactRoot
            ? "Page appears to be client-side rendered only — AI crawlers can't read JavaScript"
            : `Very little text content in initial HTML (${textLength} chars)`,
        recommendation:
          "Use server-side rendering (SSR) or static generation (SSG) so AI crawlers can read your content without JavaScript.",
        details: { textLength, isClientOnly: hasReactRoot || hasJsBundles },
      };
    }

    if (textLength < 500) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 5,
        maxScore: this.maxScore,
        message: `Thin content in initial HTML (${textLength} chars)`,
        recommendation:
          "Consider adding more server-rendered content. AI crawlers prefer text-heavy pages.",
        details: { textLength },
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
      message: `Good server-rendered content (${textLength} chars)`,
      details: { textLength },
    };
  },
};
