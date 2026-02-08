<p align="center">
  <h1 align="center">GeoKit</h1>
  <p align="center">Open-source toolkit for making websites AI-ready</p>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@glincker/geo-audit"><img src="https://img.shields.io/npm/v/@glincker/geo-audit.svg?label=geo-audit" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@glincker/geo-seo"><img src="https://img.shields.io/npm/v/@glincker/geo-seo.svg?label=geo-seo" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@glincker/geomark"><img src="https://img.shields.io/npm/v/@glincker/geomark.svg?label=geomark" alt="npm version"></a>
  <a href="https://github.com/glincker/geokit/actions"><img src="https://github.com/glincker/geokit/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

---

GeoKit is a suite of developer tools for **Generative Engine Optimization (GEO)** — making your website visible to AI crawlers like ChatGPT, Claude, Perplexity, and Google AI Overviews.

Traditional SEO focused on ranking. GEO focuses on **being cited** in AI-generated answers.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@glincker/geo-audit`](./packages/geo-audit) | CLI that scores any website's AI-readiness 0-100 | Published |
| [`@glincker/geo-seo`](./packages/geo-seo) | Generate llms.txt, JSON-LD, robots.txt, sitemap for AI discoverability | Published |
| [`@glincker/geomark`](./packages/geomark) | Convert any URL to clean markdown with metadata | Published |

### Framework Adapters (planned)

| Package | Framework |
|---------|-----------|
| `@glincker/geo-seo-next` | Next.js |
| `@glincker/geo-seo-astro` | Astro |
| `@glincker/geo-seo-nuxt` | Nuxt |
| `@glincker/geo-seo-vue` | Vue / Vite |
| `@glincker/geo-seo-angular` | Angular |
| `@glincker/geo-seo-remix` | Remix |

## Quick Start

```bash
# Audit any website (no install needed)
npx @glincker/geo-audit https://yoursite.com

# Install globally
npm install -g @glincker/geo-audit
geo-audit https://yoursite.com
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
npm run test     # Run all tests (221 passing)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add rules, run tests, and submit PRs.

## License

MIT - see [LICENSE](./LICENSE)

## Links

- [geo.glincker.com](https://geo.glincker.com)
- [npm: @glincker/geo-audit](https://www.npmjs.com/package/@glincker/geo-audit)
- [Report Issues](https://github.com/glincker/geokit/issues)

---

<p align="center">Made by <a href="https://glincker.com">Glincker</a></p>
