import type { Rule, PageData, RuleResult } from "../types.js";

/** R19: Check llms.txt content quality */
export const r19LlmsQuality: Rule = {
  id: "R19",
  name: "llms.txt Content Quality",
  description: "Analyze the quality and completeness of llms.txt content",
  category: "discoverability",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const { llmsTxt } = page;

    // Skip if llms.txt doesn't exist (R01 handles existence)
    if (!llmsTxt.ok || llmsTxt.status !== 200) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "skip",
        score: 5,
        maxScore: this.maxScore,
        message: "llms.txt does not exist (skipped)",
      };
    }

    const body = llmsTxt.body.trim();

    // Skip if empty (R01 handles this)
    if (body.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "skip",
        score: 5,
        maxScore: this.maxScore,
        message: "llms.txt is empty (skipped)",
      };
    }

    let qualityScore = 0;
    const signals: string[] = [];

    // 1. Has H1 heading?
    if (/^#\s+.+/m.test(body)) {
      qualityScore++;
      signals.push("H1 heading");
    }

    // 2. Has at least 100 chars of content?
    if (body.length >= 100) {
      qualityScore++;
      signals.push("sufficient length");
    }

    // 3. Has links (markdown URLs)?
    if (/\[.+\]\(.+\)/m.test(body)) {
      qualityScore++;
      signals.push("contains links");
    }

    // 4. Has multiple sections (multiple ## headings)?
    const h2Count = (body.match(/^##\s+.+/gm) || []).length;
    if (h2Count >= 2) {
      qualityScore++;
      signals.push("multiple sections");
    }

    // 5. Has description text (not just headings)?
    const nonHeadingLines = body
      .split("\n")
      .filter((line) => !line.trim().startsWith("#") && line.trim().length > 0);
    if (nonHeadingLines.length >= 3) {
      qualityScore++;
      signals.push("descriptive content");
    }

    if (qualityScore >= 4) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 5,
        maxScore: this.maxScore,
        message: `High-quality llms.txt (${qualityScore}/5 signals): ${signals.join(", ")}`,
        details: { qualityScore, signals },
      };
    }

    if (qualityScore >= 2) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `llms.txt could be improved (${qualityScore}/5 signals)`,
        recommendation:
          "Enhance llms.txt with: H1 heading, sufficient content (100+ chars), markdown links, multiple sections (## headings), and descriptive text.",
        details: { qualityScore, signals },
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "fail",
      score: 1,
      maxScore: this.maxScore,
      message: `Minimal llms.txt quality (${qualityScore}/5 signals)`,
      recommendation:
        "Improve llms.txt with: H1 heading, more content, markdown links, multiple sections, and descriptive paragraphs.",
      details: { qualityScore, signals },
    };
  },
};
