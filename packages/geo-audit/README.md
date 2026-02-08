# geo-audit

Audit any website's AI-readiness. Get a score 0-100.

[![npm version](https://img.shields.io/npm/v/geo-audit.svg)](https://www.npmjs.com/package/geo-audit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/glincker/geokit.svg)](https://github.com/glincker/geokit)

**geo-audit** is a professional CLI tool that evaluates how well your website is optimized for AI crawlers and generative engines like ChatGPT, Claude, Perplexity, and Google AI Overviews. Get actionable recommendations to improve your GEO (Generative Engine Optimization) strategy.

## Installation

```bash
# Install globally
npm install -g geo-audit

# Or use with npx (no installation)
npx geo-audit https://example.com
```

## Quick Start

```bash
# Audit a website
geo-audit https://glincker.com

# Output as JSON
geo-audit https://glincker.com --json

# Fail CI/CD if score is below 70
geo-audit https://glincker.com --fail-under 70
```

## Example Output

```
🔍 GEO Audit: glincker.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score: 72/100 (C)

AI Discoverability          15/40
  ❌ llms.txt missing         0/10
  ⚠️  robots.txt (no AI rules)  5/10
  ✅ sitemap.xml              10/10
  ❌ No RSS/Atom feed          0/5
  ⚠️  llms.txt quality          0/5

Structured Data             30/35
  ✅ JSON-LD (Organization)   10/10
  ✅ OpenGraph tags           10/10
  ⚠️  Meta description long    3/5
  ✅ Canonical URL             5/5
  ⚠️  Identity schema           2/5

Content Quality             30/38
  ⚠️  Heading hierarchy        5/10
  ✅ SSR content detected     10/10
  ⚠️  FAQ (no schema)          2/5
  ✅ Language tag               3/3
  ✅ Image alt text             5/5
  ✅ Semantic HTML              5/5

Technical AI-Readiness      18/21
  ⚠️  TTFB: 1087ms             7/10
  ✅ Content-Type + gzip       5/5
  ✅ HTTPS                     3/3
  ✅ Viewport meta tag         3/3

📋 Top Recommendations:
  1. Add /llms.txt (+10 points)
  2. Add AI crawler rules to robots.txt (+5 points)
  3. Fix heading hierarchy (+5 points)

Powered by GeoKit — geo.glincker.com
```

## Audit Rules

geo-audit evaluates **20 rules** across 4 categories:

| ID | Rule Name | Category | Max Points |
|----|-----------|----------|------------|
| **R01** | llms.txt Exists | AI Discoverability | 10 |
| **R02** | robots.txt AI Crawler Rules | AI Discoverability | 10 |
| **R03** | Sitemap.xml Exists | AI Discoverability | 10 |
| **R18** | RSS/Atom Feed Detection | AI Discoverability | 5 |
| **R19** | llms.txt Content Quality | AI Discoverability | 5 |
| **R04** | JSON-LD Schema.org Markup | Structured Data | 10 |
| **R05** | OpenGraph Tags | Structured Data | 10 |
| **R06** | Meta Description | Structured Data | 5 |
| **R07** | Canonical URL | Structured Data | 5 |
| **R17** | Identity Schema Detection | Structured Data | 5 |
| **R08** | Heading Hierarchy | Content Quality | 10 |
| **R09** | Content Accessibility (SSR) | Content Quality | 10 |
| **R10** | FAQ Content Detection | Content Quality | 5 |
| **R13** | Language Tag | Content Quality | 3 |
| **R15** | Image Alt Text Coverage | Content Quality | 5 |
| **R16** | Semantic HTML | Content Quality | 5 |
| **R11** | Response Time | Technical AI-Readiness | 10 |
| **R12** | Content-Type & Encoding | Technical AI-Readiness | 5 |
| **R14** | HTTPS Enforcement | Technical AI-Readiness | 3 |
| **R20** | Mobile Viewport Meta Tag | Technical AI-Readiness | 3 |
| | **TOTAL** | | **134** |

Scores are normalized to 0-100 regardless of raw points total.

### Category Breakdown

- **AI Discoverability** (40 points): llms.txt, robots.txt, sitemap.xml, RSS feeds, llms.txt quality
- **Structured Data** (35 points): JSON-LD, OpenGraph, meta tags, canonical URL, identity schema
- **Content Quality** (38 points): Heading structure, SSR content, FAQ schema, lang tag, alt text, semantic HTML
- **Technical AI-Readiness** (21 points): Response time, content encoding, HTTPS, viewport

## Scoring

Scores are calculated on a 0-100 scale with letter grades:

| Grade | Score Range | Description |
|-------|-------------|-------------|
| **A** | 90-100 | Excellent AI-readiness |
| **B** | 75-89 | Good AI optimization |
| **C** | 60-74 | Acceptable, needs improvement |
| **D** | 40-59 | Poor AI-readiness |
| **F** | 0-39 | Critical issues |

## JSON Output

Use `--json` to get machine-readable output:

```bash
geo-audit https://example.com --json
```

```json
{
  "url": "https://example.com",
  "score": 72,
  "grade": "C",
  "timestamp": "2025-02-08T14:30:00.000Z",
  "duration": 1234,
  "version": "0.1.0",
  "categories": [
    {
      "name": "AI Discoverability",
      "slug": "discoverability",
      "maxPoints": 30,
      "score": 15,
      "rules": [...]
    }
  ],
  "rules": [
    {
      "id": "R01",
      "name": "llms.txt Exists",
      "category": "discoverability",
      "status": "fail",
      "score": 0,
      "maxScore": 10,
      "message": "No /llms.txt file found",
      "recommendation": "Add /llms.txt to help AI systems understand your site..."
    }
  ],
  "recommendations": [
    {
      "rule": "R01",
      "message": "Add /llms.txt to help AI systems understand your site...",
      "impact": 10
    }
  ]
}
```

## CLI Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--json` | `-j` | Output results as JSON instead of formatted text |
| `--verbose` | | Show detailed information for each rule |
| `--quiet` | `-q` | Only show score and grade (minimal output) |
| `--fail-under <n>` | | Exit with code 1 if score is below threshold (useful for CI/CD) |
| `--timeout <ms>` | | Set HTTP request timeout in milliseconds (default: 10000) |
| `--no-recommendations` | | Hide the recommendations section from output |
| `--insecure` | | Skip SSL certificate verification |
| `--debug` | | Show debug information and HTTP request details |
| `--help` | `-h` | Display help information |
| `--version` | `-v` | Show version number |

## Programmatic API

Use geo-audit in your Node.js projects:

```typescript
import { audit } from 'geo-audit';

const result = await audit('https://example.com', {
  timeout: 10000,
  userAgent: 'MyBot/1.0',
  insecure: false
});

console.log(`Score: ${result.score}/100 (${result.grade})`);
console.log(`Categories:`, result.categories);
console.log(`Top recommendation:`, result.recommendations[0]);
```

### API Options

```typescript
interface AuditOptions {
  /** Timeout in milliseconds for each request (default: 10000) */
  timeout?: number;
  /** User-agent to use for requests */
  userAgent?: string;
  /** Skip SSL verification */
  insecure?: boolean;
}
```

## CI/CD Integration

Use geo-audit in your CI/CD pipeline to enforce AI-readiness standards:

```yaml
# .github/workflows/geo-audit.yml
name: GEO Audit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Run GEO Audit
        run: npx geo-audit https://yourdomain.com --fail-under 70
```

This will fail the build if your site scores below 70/100.

## Why GEO Matters

According to Gartner, **94% of CMOs are increasing their GEO budget** in 2025. AI-powered search is fundamentally changing how users discover content:

- **ChatGPT, Claude, and Perplexity** now handle millions of searches daily
- **Google AI Overviews** are displayed in 15%+ of search results
- **AI crawlers** use different signals than traditional SEO (structured data, llms.txt, response time)

Traditional SEO focused on ranking. GEO focuses on **being cited** in AI-generated answers. geo-audit helps you optimize for this new paradigm.

## What's Next?

After running an audit, focus on high-impact improvements:

1. **Add /llms.txt** — A simple markdown file that helps AI understand your site ([llmstxt.org](https://llmstxt.org))
2. **Fix structured data** — Add JSON-LD schema for Organization, WebPage, FAQ, and Product
3. **Optimize for speed** — AI crawlers have strict timeout limits (aim for <500ms TTFB)
4. **Server-side render** — AI crawlers can't execute JavaScript

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Links

- **Website**: [geo.glincker.com](https://geo.glincker.com)
- **GitHub**: [github.com/glincker/geokit](https://github.com/glincker/geokit)
- **Issues**: [github.com/glincker/geokit/issues](https://github.com/glincker/geokit/issues)
- **npm**: [npmjs.com/package/geo-audit](https://www.npmjs.com/package/geo-audit)

---

Made with ❤️ by [Glincker](https://glincker.com) | [geo.glincker.com](https://geo.glincker.com)
