/** Status of an individual rule check */
export type RuleStatus = "pass" | "warn" | "fail" | "skip";

/** Grade based on overall score */
export type Grade = "A" | "B" | "C" | "D" | "F";

/** Audit category */
export interface Category {
  name: string;
  slug: string;
  maxPoints: number;
  score: number;
  rules: RuleResult[];
}

/** Result of a single rule check */
export interface RuleResult {
  id: string;
  name: string;
  description: string;
  category: string;
  status: RuleStatus;
  score: number;
  maxScore: number;
  message: string;
  recommendation?: string;
  details?: Record<string, unknown>;
}

/** Full audit result */
export interface AuditResult {
  url: string;
  score: number;
  grade: Grade;
  categories: Category[];
  rules: RuleResult[];
  recommendations: Recommendation[];
  timestamp: string;
  duration: number;
  version: string;
}

/** Actionable recommendation sorted by impact */
export interface Recommendation {
  rule: string;
  message: string;
  impact: number;
  fix?: string;
}

/** Fetched page data passed to all rules */
export interface PageData {
  url: string;
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  ttfb: number;
  totalTime: number;
  llmsTxt: FetchResult;
  robotsTxt: FetchResult;
  sitemapXml: FetchResult;
}

/** Result of fetching a specific resource */
export interface FetchResult {
  ok: boolean;
  status: number;
  body: string;
  error?: string;
}

/** A rule definition */
export interface Rule {
  id: string;
  name: string;
  description: string;
  category: string;
  maxScore: number;
  check(page: PageData): RuleResult | Promise<RuleResult>;
}

/** Options for the audit function */
export interface AuditOptions {
  /** Timeout in milliseconds for each request (default: 10000) */
  timeout?: number;
  /** User-agent to use for requests */
  userAgent?: string;
  /** Skip SSL verification */
  insecure?: boolean;
}

/** CLI flags */
export interface CliFlags {
  url?: string;
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  failUnder?: number;
  help?: boolean;
  version?: boolean;
  debug?: boolean;
  insecure?: boolean;
  noRecommendations?: boolean;
  timeout?: number;
}
