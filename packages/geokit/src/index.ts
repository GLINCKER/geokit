// Re-export from geo-audit
export {
  audit,
  getFixSuggestion,
  formatBadge,
  gradeToColor,
} from "@glincker/geo-audit";
export type {
  AuditResult,
  AuditOptions,
  RuleResult,
  RuleStatus,
  Category,
  Grade,
  Recommendation,
  FixSuggestion,
  BadgeSnippets,
} from "@glincker/geo-audit";

// Re-export from geo-seo
export {
  defineConfig,
  validateConfig,
  generateConfigTemplate,
  generateAll,
  generateLlmsTxt,
  generateJsonLd,
  generateRobotsTxt,
  generateSitemap,
} from "@glincker/geo-seo";
export type {
  GeoSeoConfig,
  SiteMetadata,
  OrganizationInfo,
  PageEntry,
  JsonLdType,
  JsonLdOutput,
  AiCrawler,
  RobotsConfig,
  GenerateResult,
  GeneratedFile,
} from "@glincker/geo-seo";

// Re-export from geomark
export {
  geomark,
  extractMetadata,
  htmlToMarkdown,
  generateFrontmatter,
  estimateTokens,
  countWords,
  estimateReadingTime,
  fetchUrl,
  extractContent,
} from "@glincker/geomark";
export type {
  GeomarkResult,
  GeomarkOptions,
  PageMetadata,
} from "@glincker/geomark";

// GeoKit-specific exports
export { fix, buildConfigFromAudit, FIX_MAP } from "./fix.js";
export type {
  FixResult,
  FixAction,
  FixMapping,
  GeokitCliFlags,
} from "./types.js";
