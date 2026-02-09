import type { Rule, PageData, RuleResult } from "../types.js";

const EXTENDED_AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Amazonbot",
  "CCBot",
  "Bytespider",
  "cohere-ai",
  "Meta-ExternalAgent",
  "FacebookBot",
  "Applebot-Extended",
  "YouBot",
  "Omgilibot",
  "AI2Bot",
  "Diffbot",
];

interface BotStatus {
  allowed: string[];
  blocked: string[];
  unmentioned: string[];
}

/** R21: Check breadth of AI bot coverage in robots.txt */
export const r21AiBotCoverage: Rule = {
  id: "R21",
  name: "AI Bot Coverage Breadth",
  description: "Check how many AI crawlers are explicitly addressed in robots.txt",
  category: "discoverability",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const { robotsTxt } = page;

    if (!robotsTxt.ok || robotsTxt.status !== 200) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "skip",
        score: 0,
        maxScore: this.maxScore,
        message: "No robots.txt found (R02 handles basic check)",
      };
    }

    const body = robotsTxt.body;
    const botStatus: BotStatus = {
      allowed: [],
      blocked: [],
      unmentioned: [],
    };

    // Parse robots.txt to find bot mentions and their status
    EXTENDED_AI_BOTS.forEach((bot) => {
      const botPattern = new RegExp(`user-agent:\\s*${bot}`, "i");
      const match = botPattern.exec(body);

      if (match) {
        // Find the section for this bot and check if it has Disallow: /
        const sectionStart = match.index;
        const nextBotMatch = body.slice(sectionStart + 1).search(/user-agent:/i);
        const sectionEnd = nextBotMatch === -1
          ? body.length
          : sectionStart + nextBotMatch + 1;
        const section = body.slice(sectionStart, sectionEnd);

        if (/disallow:\s*\//i.test(section)) {
          botStatus.blocked.push(bot);
        } else {
          botStatus.allowed.push(bot);
        }
      } else {
        botStatus.unmentioned.push(bot);
      }
    });

    const mentionedCount = botStatus.allowed.length + botStatus.blocked.length;

    if (mentionedCount === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No AI bots explicitly addressed in robots.txt",
        recommendation: `Add explicit User-agent rules for major AI crawlers (GPTBot, ClaudeBot, Google-Extended, etc.)`,
        details: {
          mentioned: mentionedCount,
          allowed: botStatus.allowed,
          blocked: botStatus.blocked,
          unmentioned: botStatus.unmentioned,
        },
      };
    }

    if (mentionedCount >= 1 && mentionedCount <= 3) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: `Only ${mentionedCount} AI bot(s) addressed - limited coverage`,
        recommendation: `Expand coverage to include more AI crawlers (currently ${mentionedCount}/18)`,
        details: {
          mentioned: mentionedCount,
          allowed: botStatus.allowed,
          blocked: botStatus.blocked,
          unmentioned: botStatus.unmentioned,
        },
      };
    }

    if (mentionedCount >= 4 && mentionedCount <= 6) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `${mentionedCount} AI bots addressed - moderate coverage`,
        recommendation: `Consider adding more AI crawlers for comprehensive coverage (currently ${mentionedCount}/18)`,
        details: {
          mentioned: mentionedCount,
          allowed: botStatus.allowed,
          blocked: botStatus.blocked,
          unmentioned: botStatus.unmentioned,
        },
      };
    }

    // 7+ bots
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 5,
      maxScore: this.maxScore,
      message: `${mentionedCount} AI bots addressed - good coverage`,
      details: {
        mentioned: mentionedCount,
        allowed: botStatus.allowed,
        blocked: botStatus.blocked,
        unmentioned: botStatus.unmentioned,
      },
    };
  },
};
