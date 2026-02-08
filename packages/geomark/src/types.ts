/** Options for the geomark function */
export interface GeomarkOptions {
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** Include metadata extraction (default: true) */
  includeMetadata?: boolean;
  /** Include token estimation (default: true) */
  estimateTokens?: boolean;
  /** Custom user agent */
  userAgent?: string;
}

/** Extracted page metadata */
export interface PageMetadata {
  /** Page title from <title> or og:title */
  title: string;
  /** Page description from meta or og:description */
  description: string;
  /** Author from meta or article:author */
  author: string;
  /** Publication date */
  published: string;
  /** OG image URL */
  ogImage: string;
  /** Extracted JSON-LD data */
  jsonLd: Record<string, unknown> | null;
  /** Canonical URL */
  canonical: string;
  /** Page language */
  lang: string;
  /** Site name from og:site_name */
  siteName: string;
  /** Content type from og:type */
  ogType: string;
  /** All Open Graph tags */
  openGraph: Record<string, string>;
}

/** Result of geomark conversion */
export interface GeomarkResult {
  /** Original URL */
  url: string;
  /** Extracted page title */
  title: string;
  /** Converted markdown content */
  markdown: string;
  /** Extracted metadata */
  metadata: PageMetadata;
  /** Estimated token count */
  tokens: number;
  /** Word count */
  wordCount: number;
  /** Estimated reading time in minutes */
  readingTime: number;
  /** ISO timestamp of when content was fetched */
  fetchedAt: string;
}

/** CLI flags */
export interface GeomarkCliFlags {
  url?: string;
  output?: string;
  json?: boolean;
  frontmatter?: boolean;
  help?: boolean;
  version?: boolean;
  timeout?: number;
}
