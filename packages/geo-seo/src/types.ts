/** Site-level metadata */
export interface SiteMetadata {
  /** Site name */
  name: string;
  /** Full URL including protocol */
  url: string;
  /** Site description */
  description: string;
  /** Path or URL to site logo */
  logo?: string;
}

/** Organization info for JSON-LD */
export interface OrganizationInfo {
  /** Organization name */
  name: string;
  /** Organization URL */
  url: string;
  /** Full URL to organization logo */
  logo?: string;
  /** Social profile URLs */
  sameAs?: string[];
  /** Contact info */
  contactPoint?: {
    type: string;
    telephone?: string;
    email?: string;
  };
}

/** Page entry for sitemap and llms.txt generation */
export interface PageEntry {
  /** URL path (e.g. '/' or '/about') */
  path: string;
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Sitemap change frequency */
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  /** Sitemap priority (0.0 to 1.0) */
  priority?: number;
  /** Last modified date (ISO string) */
  lastmod?: string;
  /** JSON-LD schema type for this page */
  schemaType?: JsonLdType;
  /** Additional schema properties for this page */
  schemaProps?: Record<string, unknown>;
}

/** Supported JSON-LD types */
export type JsonLdType =
  | "Organization"
  | "WebSite"
  | "WebPage"
  | "Article"
  | "BlogPosting"
  | "FAQPage"
  | "Product"
  | "BreadcrumbList";

/** AI crawler names */
export type AiCrawler =
  | "GPTBot"
  | "ChatGPT-User"
  | "ClaudeBot"
  | "Claude-Web"
  | "PerplexityBot"
  | "Amazonbot"
  | "CCBot"
  | "Google-Extended"
  | "FacebookBot"
  | "Bytespider"
  | "Applebot-Extended"
  | "cohere-ai"
  | "Diffbot"
  | "ImagesiftBot"
  | "Omgilibot"
  | "YouBot";

/** Robots.txt configuration */
export interface RobotsConfig {
  /** Preset mode for AI crawlers */
  aiCrawlers: "allow" | "block" | "selective";
  /** Allowed AI crawlers (when selective) */
  allow?: AiCrawler[];
  /** Blocked AI crawlers (when selective) */
  block?: AiCrawler[];
  /** Sitemap URL (auto-generated if not set) */
  sitemap?: string;
  /** Crawl delay in seconds */
  crawlDelay?: number;
  /** Additional custom rules */
  customRules?: RobotsRule[];
}

/** Custom robots.txt rule */
export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
}

/** Output configuration */
export interface OutputConfig {
  /** Directory to write generated files */
  dir: string;
  /** Which files to generate */
  files?: {
    llmsTxt?: boolean;
    robotsTxt?: boolean;
    sitemap?: boolean;
  };
}

/** Main configuration object */
export interface GeoSeoConfig {
  /** Site metadata */
  site: SiteMetadata;
  /** Organization info for JSON-LD */
  organization?: OrganizationInfo;
  /** Page entries */
  pages: PageEntry[];
  /** Robots.txt config */
  robots?: RobotsConfig;
  /** Output directory (default: './public') */
  output?: string;
}

/** Result of generating all files */
export interface GenerateResult {
  /** Files that were generated */
  files: GeneratedFile[];
  /** Total files generated */
  count: number;
}

/** A generated file */
export interface GeneratedFile {
  /** File path relative to output dir */
  name: string;
  /** Full path where file was written */
  path: string;
  /** Size in bytes */
  size: number;
}

/** JSON-LD output structure */
export interface JsonLdOutput {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
}

/** CLI flags */
export interface GeoSeoCliFlags {
  command?: "generate" | "init" | "validate";
  out?: string;
  only?: "llms-txt" | "robots-txt" | "sitemap" | "json-ld";
  config?: string;
  help?: boolean;
  version?: boolean;
}
