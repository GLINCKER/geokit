<p align="center">
  <h1 align="center">GeoKit</h1>
  <p align="center">Open-source toolkit for making websites AI-ready</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@glincker/geo-audit"><img src="https://img.shields.io/npm/v/@glincker/geo-audit.svg?label=geo-audit" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@glincker/geo-seo"><img src="https://img.shields.io/npm/v/@glincker/geo-seo.svg?label=geo-seo" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@glincker/geomark"><img src="https://img.shields.io/npm/v/@glincker/geomark.svg?label=geomark" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@glincker/geokit"><img src="https://img.shields.io/npm/v/@glincker/geokit.svg?label=geokit" alt="npm version"></a>
  <a href="https://github.com/glincker/geokit/actions"><img src="https://github.com/glincker/geokit/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/marketplace/actions/geo-audit-ai-readiness-score"><img src="https://img.shields.io/badge/GitHub%20Action-Marketplace-blue?logo=github" alt="GitHub Action"></a>
</p>

---

GeoKit is a suite of developer tools for **Generative Engine Optimization (GEO)** — making your website visible to AI crawlers like ChatGPT, Claude, Perplexity, and Google AI Overviews.

Traditional SEO focused on ranking. GEO focuses on **being cited** in AI-generated answers.

<p align="center">
  <img src="https://raw.githubusercontent.com/glincker/geokit/main/assets/demo.gif" alt="GeoKit Demo" width="800">
</p>

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@glincker/geo-audit`](./packages/geo-audit) | CLI that scores any website's AI-readiness 0-100 | Published |
| [`@glincker/geo-seo`](./packages/geo-seo) | Generate llms.txt, JSON-LD, robots.txt, sitemap for AI discoverability | Published |
| [`@glincker/geomark`](./packages/geomark) | Convert any URL to clean markdown with metadata | Published |
| [`@glincker/geokit`](./packages/geokit) | Unified CLI + auto-fix pipeline | Published |

### Framework Adapters (subpath exports in `@glincker/geo-seo`)

| Import | Framework |
|--------|-----------|
| `@glincker/geo-seo/next` | Next.js |
| `@glincker/geo-seo/vite` | Vite / Vue / Svelte / Remix / SolidStart |
| `@glincker/geo-seo/astro` | Astro |
| `@glincker/geo-seo/nuxt` | Nuxt |

## Quick Start

```bash
# Audit any website (no install needed)
npx @glincker/geo-audit https://yoursite.com

# Install globally
npm install -g @glincker/geo-audit
geo-audit https://yoursite.com

# Get a badge snippet for your README
geo-audit https://yoursite.com --badge
```

### Example

```
🔍 GEO Audit: glincker.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score: 75/100 (B)

AI Discoverability  25/40
  ❌ llms.txt Exists  0/10
  ⚠️  robots.txt AI Crawler Rules  5/10

Structured Data  30/35
  ✅ JSON-LD Schema.org Markup  10/10
  ✅ OpenGraph Tags  10/10

Content Quality  30/38
  ⚠️  Heading Hierarchy  5/10
  ✅ SSR Content  10/10

Technical AI-Readiness  16/21
  ⚠️  Response Time  5/10
  ✅ HTTPS  3/3

📋 Top Recommendations:
  1. Add /llms.txt (+10 points)
  2. Add AI crawler rules to robots.txt (+5 points)
  3. Fix heading hierarchy (+5 points)
```

## What GeoKit Checks

**20 rules** across 4 categories, normalized to a 0-100 score:

- **AI Discoverability** (40 pts) — llms.txt, robots.txt AI rules, sitemap, RSS feeds
- **Structured Data** (35 pts) — JSON-LD, OpenGraph, meta tags, canonical URL, identity schema
- **Content Quality** (38 pts) — Headings, SSR, FAQ schema, lang tag, alt text, semantic HTML
- **Technical** (21 pts) — Response time, content encoding, HTTPS, viewport

## GitHub Action

Add AI-readiness checks to your CI/CD pipeline with our [Marketplace action](https://github.com/marketplace/actions/geo-audit-ai-readiness-score):

```yaml
- uses: GLINCKER/geo-audit-action@v1
  with:
    url: https://yoursite.com
    fail-under: 70
    comment: true
```

Outputs `score`, `grade`, `badge`, and full `result` JSON. Posts a PR comment with your AI-readiness report.

## Why GEO Matters

- **ChatGPT, Claude, and Perplexity** handle millions of searches daily
- **Google AI Overviews** appear in 15%+ of search results
- **AI crawlers** use different signals than traditional SEO

## Development

```bash
git clone https://github.com/glincker/geokit.git
cd geokit
npm install
npm run build    # Build all packages
npm run test     # Run all tests (323 passing)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add rules, run tests, and submit PRs.

## License

MIT - see [LICENSE](./LICENSE)

## Links

- [typeweaver.com/docs/geokit](https://typeweaver.com/docs/geokit)
- [GitHub Action (Marketplace)](https://github.com/marketplace/actions/geo-audit-ai-readiness-score)
- [npm: @glincker/geo-audit](https://www.npmjs.com/package/@glincker/geo-audit)
- [Report Issues](https://github.com/glincker/geokit/issues)

---

<p align="center">Made by <a href="https://glincker.com">Glincker</a></p>
