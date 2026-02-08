import type { Rule, PageData, RuleResult } from "../types.js";

/** R01: Check if /llms.txt exists and is valid */
export const r01LlmsTxt: Rule = {
  id: "R01",
  name: "llms.txt Exists",
  description: "Check for /llms.txt file that helps AI systems understand your site",
  category: "discoverability",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const { llmsTxt } = page;

    if (!llmsTxt.ok || llmsTxt.status !== 200) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No /llms.txt file found",
        recommendation:
          'Add /llms.txt to help AI systems understand your site. See https://llmstxt.org for the spec.',
      };
    }

    const body = llmsTxt.body.trim();
    if (body.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "/llms.txt exists but is empty",
        recommendation: "Add content to your /llms.txt — it should be valid markdown with an H1 heading.",
      };
    }

    // Check for H1 heading (markdown: line starting with #)
    const hasH1 = /^#\s+.+/m.test(body);
    if (!hasH1) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 5,
        maxScore: this.maxScore,
        message: "/llms.txt exists but missing H1 heading",
        recommendation:
          "Add a markdown H1 heading (# Your Site Name) to your /llms.txt for proper structure.",
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
      message: "/llms.txt found with valid markdown structure",
    };
  },
};
