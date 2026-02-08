import type { AuditResult, AuditOptions, RuleResult } from "./types.js";
import { fetchPageData } from "./fetcher.js";
import { allRules } from "./rules/index.js";
import {
  calculateScore,
  getGrade,
  buildCategories,
  buildRecommendations,
} from "./score.js";

const VERSION = "0.1.0";

/**
 * Run a full GEO audit on a URL.
 *
 * @param url - The URL to audit
 * @param options - Audit options (timeout, user-agent, etc.)
 * @returns Full audit result with scores, categories, and recommendations
 */
export async function audit(
  url: string,
  options: AuditOptions = {},
): Promise<AuditResult> {
  const startTime = performance.now();

  // Fetch all page data
  const pageData = await fetchPageData(url, options);

  // Run all rules
  const results: RuleResult[] = [];
  for (const rule of allRules) {
    const result = await rule.check(pageData);
    results.push(result);
  }

  const score = calculateScore(results);
  const grade = getGrade(score);
  const categories = buildCategories(results);
  const recommendations = buildRecommendations(results);
  const duration = Math.round(performance.now() - startTime);

  return {
    url: pageData.url,
    score,
    grade,
    categories,
    rules: results,
    recommendations,
    timestamp: new Date().toISOString(),
    duration,
    version: VERSION,
  };
}
