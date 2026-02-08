import type {
  Grade,
  Category,
  RuleResult,
  Recommendation,
} from "./types.js";
import { getFixSuggestion } from "./fixes.js";

/** Category definitions with max points */
const CATEGORY_DEFS = [
  { name: "AI Discoverability", slug: "discoverability", maxPoints: 40 },
  { name: "Structured Data", slug: "structured-data", maxPoints: 35 },
  { name: "Content Quality", slug: "content-quality", maxPoints: 38 },
  { name: "Technical AI-Readiness", slug: "technical", maxPoints: 21 },
] as const;



/** Calculate letter grade from 0-100 score */
export function getGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Group rule results into categories with scores */
export function buildCategories(results: RuleResult[]): Category[] {
  return CATEGORY_DEFS.map((def) => {
    const rules = results.filter((r) => r.category === def.slug);
    const score = rules.reduce((sum, r) => sum + r.score, 0);
    return {
      name: def.name,
      slug: def.slug,
      maxPoints: def.maxPoints,
      score: Math.min(score, def.maxPoints),
      rules,
    };
  });
}

/** Calculate overall score (0-100) from rule results */
export function calculateScore(results: RuleResult[]): number {
  const totalMax = results.reduce((sum, r) => sum + r.maxScore, 0);
  if (totalMax === 0) return 0;
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  return Math.round((totalScore / totalMax) * 100);
}

/** Generate sorted recommendations from failed/warned rules */
export function buildRecommendations(results: RuleResult[]): Recommendation[] {
  return results
    .filter((r) => r.status !== "pass" && r.status !== "skip" && r.recommendation)
    .map((r) => {
      const fix = getFixSuggestion(r.id);
      return {
        rule: r.id,
        message: r.recommendation!,
        impact: r.maxScore - r.score,
        ...(fix && { fix: fix.command }),
      };
    })
    .sort((a, b) => b.impact - a.impact);
}
