import type { Rule, PageData, RuleResult } from "../types.js";

/** R22: Check for llms-full.txt companion file */
export const r22LlmsFullTxt: Rule = {
  id: "R22",
  name: "llms-full.txt Exists",
  description: "Check for /llms-full.txt companion file (per llmstxt.org spec)",
  category: "discoverability",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const { llmsFullTxt } = page;

    if (!llmsFullTxt.ok || llmsFullTxt.status !== 200) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No /llms-full.txt file found",
        recommendation:
          "Add /llms-full.txt with comprehensive documentation for AI training",
        details: { status: llmsFullTxt.status },
      };
    }

    const trimmedBody = llmsFullTxt.body.trim();

    if (trimmedBody.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "/llms-full.txt exists but is empty",
        recommendation:
          "Populate /llms-full.txt with detailed site documentation",
        details: { length: 0 },
      };
    }

    if (trimmedBody.length < 500) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `/llms-full.txt is too short (${trimmedBody.length} chars)`,
        recommendation:
          "Expand /llms-full.txt with more comprehensive documentation (aim for 500+ characters)",
        details: { length: trimmedBody.length },
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
      message: `/llms-full.txt is substantial (${trimmedBody.length} chars)`,
      details: { length: trimmedBody.length },
    };
  },
};
