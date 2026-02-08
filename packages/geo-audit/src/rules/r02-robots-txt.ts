import type { Rule, PageData, RuleResult } from "../types.js";

const AI_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Amazonbot",
  "anthropic-ai",
  "CCBot",
  "ChatGPT-User",
  "Bytespider",
  "cohere-ai",
];

/** R02: Check robots.txt for AI crawler rules */
export const r02RobotsTxt: Rule = {
  id: "R02",
  name: "robots.txt AI Crawler Rules",
  description: "Check if robots.txt has explicit rules for AI crawlers",
  category: "discoverability",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const { robotsTxt } = page;

    if (!robotsTxt.ok || robotsTxt.status !== 200) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No robots.txt found",
        recommendation:
          "Add a robots.txt file with explicit rules for AI crawlers (GPTBot, ClaudeBot, etc.)",
      };
    }

    const body = robotsTxt.body.toLowerCase();
    const foundBots = AI_BOTS.filter((bot) =>
      body.includes(`user-agent: ${bot.toLowerCase()}`),
    );

    if (foundBots.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 5,
        maxScore: this.maxScore,
        message:
          "robots.txt exists but has no AI-specific crawler rules",
        recommendation:
          "Add explicit User-agent rules for GPTBot, ClaudeBot, and PerplexityBot to control AI crawler access.",
        details: { foundBots: [] },
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
      message: `robots.txt has rules for ${foundBots.length} AI crawler(s)`,
      details: { foundBots },
    };
  },
};
