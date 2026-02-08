/** Fix suggestion for a failed audit rule */
export interface FixSuggestion {
  /** CLI command to run */
  command: string;
  /** Whether this can be applied automatically (no user config needed) */
  automatic: boolean;
}

/** Map of rule IDs to their fix suggestions */
const FIX_MAP: Record<string, FixSuggestion> = {
  R01: { command: "npx geo-seo generate --only llms-txt", automatic: true },
  R02: { command: "npx geo-seo generate --only robots-txt", automatic: true },
  R03: { command: "npx geo-seo generate --only sitemap", automatic: true },
  R04: { command: "npx geo-seo generate", automatic: false },
  R17: { command: "npx geo-seo generate", automatic: false },
};

/**
 * Get a fix suggestion for a given audit rule ID.
 * Returns undefined if no automated fix is available.
 */
export function getFixSuggestion(ruleId: string): FixSuggestion | undefined {
  return FIX_MAP[ruleId];
}
