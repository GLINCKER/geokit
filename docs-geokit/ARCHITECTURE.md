# GeoKit Architecture

## Monorepo Layout

- **Build**: Turborepo, tsup (ESM+CJS dual), vitest
- **Versioning**: Lockstep across all 4 packages via `scripts/sync-versions.js`
- **Release**: Conventional commits → `auto-release.yml` → npm OIDC publish

```
geokit/
├── packages/
│   ├── geo-audit/    # AI-readiness audit (20 rules, 0-100 score)
│   ├── geo-seo/      # Generate llms.txt, robots.txt, sitemap, JSON-LD
│   ├── geomark/      # URL → clean markdown converter
│   └── geokit/       # Unified CLI + fix pipeline
├── actions/
│   └── geo-audit-action/  # GitHub Action (composite)
├── scripts/
│   └── sync-versions.js   # Lockstep version sync
├── docs-geokit/           # Architecture docs
└── .github/workflows/     # CI + auto-release
```

## Scoring System

- Formula: `(totalScore / totalMax) * 100`, rounded
- Grades: A>=90, B>=75, C>=60, D>=40, F<40
- 20 rules, 134 raw max points, 4 categories

### Categories & Points

| Category | Slug | Max Pts | Rules |
|----------|------|---------|-------|
| AI Discoverability | discoverability | 40 | R01,R02,R03,R18,R19 |
| Structured Data | structured-data | 35 | R04,R05,R06,R07,R17 |
| Content Quality | content-quality | 38 | R08,R09,R10,R13,R15,R16 |
| Technical | technical | 21 | R11,R12,R14,R20 |

### Rules Quick Reference

| ID | Name | Max | Category | Method |
|----|------|-----|----------|--------|
| R01 | llms.txt Exists | 10 | discoverability | fetch /llms.txt |
| R02 | robots.txt AI Crawlers | 10 | discoverability | fetch /robots.txt |
| R03 | Sitemap.xml | 10 | discoverability | fetch /sitemap.xml |
| R04 | JSON-LD Schema | 10 | structured-data | cheerio |
| R05 | Open Graph Tags | 8 | structured-data | cheerio |
| R06 | Meta Description | 7 | structured-data | cheerio |
| R07 | Canonical URL | 5 | structured-data | cheerio |
| R08 | Heading Structure | 8 | content-quality | cheerio |
| R09 | SSR Content | 8 | content-quality | cheerio |
| R10 | FAQ Schema | 8 | content-quality | cheerio |
| R11 | Response Time | 10 | technical | TTFB measurement |
| R12 | Content-Type | 5 | technical | headers |
| R13 | Language Tag | 5 | content-quality | cheerio |
| R14 | HTTPS | 4 | technical | URL scheme |
| R15 | Alt Text | 5 | content-quality | cheerio |
| R16 | Semantic HTML | 4 | content-quality | cheerio |
| R17 | Identity Schema | 5 | structured-data | cheerio |
| R18 | RSS Feed | 5 | discoverability | cheerio |
| R19 | llms.txt Quality | 5 | discoverability | fetch |
| R20 | Viewport | 2 | technical | cheerio |

## Key Interfaces

```typescript
// Rule interface
interface Rule {
  id: string; name: string; category: string;
  maxScore: number;
  check(page: PageData): RuleResult | Promise<RuleResult>;
}

// Input to all rules
interface PageData {
  url: string; html: string; statusCode: number;
  headers: Record<string, string>;
  ttfb: number; totalTime: number;
  llmsTxt: FetchResult; robotsTxt: FetchResult; sitemapXml: FetchResult;
}

// Fetch helper result
interface FetchResult { ok: boolean; status: number; body: string; error?: string; }
```

## CLI Architecture

- `geo-audit`: Manual `parseArgs()` switch/case, chalk for colors, custom spinner
- `geokit`: Same pattern, delegates to `@glincker/geo-audit`, `@glincker/geo-seo`, `@glincker/geomark`
- Flags: `--json`, `--verbose`, `--quiet`, `--badge`, `--fail-under <n>`, `--timeout <ms>`, `--insecure`

## Framework Adapters (geo-seo)

Subpath exports: `@glincker/geo-seo/next`, `/vite`, `/astro`, `/nuxt`

## Key File Map

```
packages/geo-audit/src/
├── audit.ts          # Main audit() function, orchestrates rules
├── cli.ts            # CLI entry point, parseArgs, formatters
├── fetcher.ts        # HTTP fetching, SSRF blocking, PageData construction
├── types.ts          # All TypeScript interfaces
├── index.ts          # Public API exports
├── badge.ts          # Badge URL/snippet generation
├── fixes.ts          # Fix suggestions per rule
├── score.ts          # Score calculation, grade assignment
├── rules/            # 20 rule files (r01-*.ts through r20-*.ts)
└── __tests__/        # Vitest tests, helpers.ts for mocks

packages/geokit/src/
├── cli.ts            # Unified CLI (audit/generate/convert/fix/init)
├── fix.ts            # Fix pipeline (audit → generate missing files)
├── types.ts          # GeokitCliFlags, FixResult, FixAction
└── index.ts          # Re-exports from all packages
```

## SSRF Protection

```typescript
const BLOCKED_PATTERNS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./, /^0\./, /^localhost$/i, /^\[::1\]$/,
];
```

## Badge API (Cloudflare Worker)

- Worker: `geo-badge` at `geo-badge.<subdomain>.workers.dev`
- KV: `geo-badge-cache` with 24h TTL per URL hostname
- Endpoints: `GET /?url=` (shields.io JSON), `GET /json?url=` (full result)
- 12 regex-based rules (no cheerio), normalized to 100
- Color mapping: A=brightgreen, B=green, C=yellow, D=orange, F=red
