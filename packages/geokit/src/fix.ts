import { audit, getFixSuggestion } from "@glincker/geo-audit";
import { generateAll, defineConfig } from "@glincker/geo-seo";
import type { GeoSeoConfig } from "@glincker/geo-seo";
import { geomark } from "@glincker/geomark";
import type { FixAction, FixMapping, FixResult } from "./types.js";

/** Map of auto-fixable rules to their fix configuration */
export const FIX_MAP: FixMapping[] = [
  { ruleId: "R01", only: "llms-txt", automatic: true },
  { ruleId: "R02", only: "robots-txt", automatic: true },
  { ruleId: "R03", only: "sitemap", automatic: true },
  { ruleId: "R04", only: undefined, automatic: false },
  { ruleId: "R17", only: undefined, automatic: false },
];

/**
 * Build a minimal GeoSeoConfig from audit result and extracted metadata.
 */
export function buildConfigFromAudit(
  url: string,
  siteName?: string,
  siteDescription?: string,
): GeoSeoConfig {
  const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  return defineConfig({
    site: {
      name: siteName ?? parsedUrl.hostname,
      url: baseUrl,
      description: siteDescription ?? `${parsedUrl.hostname} — AI-optimized content`,
    },
    pages: [
      {
        path: "/",
        title: siteName ?? parsedUrl.hostname,
        description: siteDescription ?? `${parsedUrl.hostname} homepage`,
      },
    ],
    robots: { aiCrawlers: "allow" },
    output: undefined, // set by caller
  });
}

/**
 * Run the full fix pipeline:
 * 1. Audit the URL
 * 2. Extract metadata with geomark
 * 3. Build a config from audit + metadata
 * 4. Filter failed rules through FIX_MAP
 * 5. Generate fix files
 * 6. Report estimated improvement
 */
export async function fix(
  url: string,
  outDir: string = "./geo-fixes",
): Promise<FixResult> {
  // Step 1: Audit
  const auditResult = await audit(url);

  // Step 2: Extract metadata
  let siteName: string | undefined;
  let siteDescription: string | undefined;
  try {
    const markResult = await geomark(url);
    siteName = markResult.metadata.siteName || markResult.title || undefined;
    siteDescription = markResult.metadata.description || undefined;
  } catch {
    // metadata extraction is best-effort — continue without it
  }

  // Step 3: Build config
  const config = buildConfigFromAudit(url, siteName, siteDescription);
  config.output = outDir;

  // Step 4: Find auto-fixable failed rules
  const failedRuleIds = new Set(
    auditResult.recommendations.map((r) => r.rule),
  );

  const autoFixable = FIX_MAP.filter(
    (m) => m.automatic && failedRuleIds.has(m.ruleId),
  );

  const actions: FixAction[] = [];
  let generateResult: FixResult["generate"] = null;

  // Step 5: Generate fixes if there are auto-fixable issues
  if (autoFixable.length > 0) {
    try {
      generateResult = await generateAll(config);

      for (const mapping of autoFixable) {
        const suggestion = getFixSuggestion(mapping.ruleId);
        actions.push({
          ruleId: mapping.ruleId,
          description: `Generated ${mapping.only ?? "all GEO files"}`,
          command: suggestion?.command ?? `npx geo-seo generate`,
          applied: true,
        });
      }
    } catch (error) {
      for (const mapping of autoFixable) {
        actions.push({
          ruleId: mapping.ruleId,
          description: `Failed to generate ${mapping.only ?? "all GEO files"}`,
          command: `npx geo-seo generate${mapping.only ? ` --only ${mapping.only}` : ""}`,
          applied: false,
        });
      }
    }
  }

  // Step 6: Calculate estimated improvement
  const fixedRuleIds = new Set(
    actions.filter((a) => a.applied).map((a) => a.ruleId),
  );
  const estimatedImprovement = auditResult.recommendations
    .filter((r) => fixedRuleIds.has(r.rule))
    .reduce((sum, r) => sum + r.impact, 0);

  const remainingIssues = auditResult.recommendations.filter(
    (r) => !fixedRuleIds.has(r.rule),
  );

  return {
    audit: auditResult,
    actions,
    generate: generateResult,
    outDir,
    estimatedImprovement,
    remainingIssues,
  };
}
