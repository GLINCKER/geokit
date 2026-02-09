import type { AuditResult, Recommendation } from "@glincker/geo-audit";
import type { GenerateResult } from "@glincker/geo-seo";

/** Result of a single fix action */
export interface FixAction {
  /** Rule ID that was fixed (e.g. R01) */
  ruleId: string;
  /** Human-readable description */
  description: string;
  /** Command that was run */
  command: string;
  /** Whether the fix was applied */
  applied: boolean;
}

/** Mapping from rule ID to fix behavior */
export interface FixMapping {
  /** Rule ID (e.g. R01) */
  ruleId: string;
  /** Which geo-seo --only flag to use, or undefined for full generate */
  only?: string;
  /** Whether this can run without user-provided config */
  automatic: boolean;
}

/** Result of the full fix pipeline */
export interface FixResult {
  /** Original audit result */
  audit: AuditResult;
  /** Actions that were taken */
  actions: FixAction[];
  /** Files that were generated */
  generate: GenerateResult | null;
  /** Output directory where files were written */
  outDir: string;
  /** Estimated score improvement */
  estimatedImprovement: number;
  /** Recommendations that could not be auto-fixed */
  remainingIssues: Recommendation[];
}

/** CLI flags for geokit */
export interface GeokitCliFlags {
  command?: "audit" | "generate" | "convert" | "fix" | "init";
  url?: string;
  out?: string;
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  help?: boolean;
  version?: boolean;
  only?: string;
  config?: string;
  timeout?: number;
  insecure?: boolean;
  badge?: boolean;
  noMeta?: boolean;
  frontmatter?: boolean;
}
