import type { Rule, PageData, RuleResult } from "../types.js";

/** R23: Check for ai.txt file declaring AI interaction permissions */
export const r23AiTxt: Rule = {
  id: "R23",
  name: "ai.txt Exists",
  description: "Check for /ai.txt declaring AI interaction permissions",
  category: "discoverability",
  maxScore: 3,

  check(page: PageData): RuleResult {
    const { aiTxt } = page;

    if (!aiTxt.ok || aiTxt.status !== 200) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No /ai.txt file found",
        recommendation:
          "Add /ai.txt to declare AI interaction permissions and policies",
        details: { status: aiTxt.status, error: aiTxt.error },
      };
    }

    const trimmedBody = aiTxt.body.trim();

    if (trimmedBody.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "/ai.txt exists but is empty",
        recommendation:
          "Populate /ai.txt with AI interaction permissions and policies",
        details: { length: 0 },
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
      message: `/ai.txt exists with content (${trimmedBody.length} chars)`,
      details: { length: trimmedBody.length },
    };
  },
};
