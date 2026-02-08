# GeoSEO

Generate GEO assets for AI discoverability — llms.txt, robots.txt, sitemap.xml, and JSON-LD.

[![npm version](https://img.shields.io/npm/v/@glincker/geo-seo.svg)](https://www.npmjs.com/package/@glincker/geo-seo)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/glincker/geokit.svg)](https://github.com/glincker/geokit)

**GeoSEO** is a framework-agnostic CLI and Node.js library that auto-generates the files AI crawlers look for — `llms.txt`, `robots.txt` with AI crawler rules, `sitemap.xml`, and `JSON-LD` structured data. Define your pages in one config file, generate everything at build time. Zero runtime overhead.

<p align="center">
  <img src="https://raw.githubusercontent.com/glincker/geokit/main/assets/geo-seo-demo.gif" alt="geo-seo demo" width="800">
</p>

## Installation

```bash
# Install globally
npm install -g @glincker/geo-seo

# Or use with npx (no installation)
npx @glincker/geo-seo generate
```

## Quick Start

```bash
# Create a starter config file
geo-seo init

# Edit geo-seo.config.ts with your site info, then:
geo-seo generate

# Generate only llms.txt
geo-seo generate --only llms-txt

# Output to a custom directory
geo-seo generate --out ./dist
```

## Configuration

Run `geo-seo init` to create a starter `geo-seo.config.ts`:

```typescript
import { defineConfig } from '@glincker/geo-seo';

export default defineConfig({
  site: {
    name: 'My Website',
    url: 'https://example.com',
    description: 'A great website',
    logo: '/logo.png',
  },
  organization: {
    name: 'My Company',
    url: 'https://example.com',
    logo: 'https://example.com/logo.png',
    sameAs: [
      'https://twitter.com/mycompany',
      'https://github.com/mycompany',
    ],
  },
  pages: [
    { path: '/', title: 'Home', description: 'Welcome to our site', changefreq: 'daily', priority: 1.0 },
    { path: '/about', title: 'About', description: 'About us' },
    { path: '/blog', title: 'Blog', description: 'Latest posts', changefreq: 'weekly' },
    { path: '/pricing', title: 'Pricing', description: 'Plans and pricing', schemaType: 'Product' },
    { path: '/faq', title: 'FAQ', description: 'Frequently asked questions', schemaType: 'FAQPage', schemaProps: {
      questions: [
        { question: 'What is GEO?', answer: 'Generative Engine Optimization...' },
      ],
    }},
  ],
  robots: {
    aiCrawlers: 'allow', // 'allow' | 'block' | 'selective'
  },
  output: './public',
});
```

## Generated Files

### llms.txt

Following the [llmstxt.org](https://llmstxt.org) specification:

```markdown
# My Website

> A great website

- [Home](https://example.com/): Welcome to our site

## Pages

- [About](https://example.com/about): About us
- [Blog](https://example.com/blog): Latest posts
- [Pricing](https://example.com/pricing): Plans and pricing
- [FAQ](https://example.com/faq): Frequently asked questions
```

### robots.txt

With AI crawler rules:

```
User-agent: *
Allow: /

# AI Crawlers: Allowed
# All AI crawlers can access this site

Sitemap: https://example.com/sitemap.xml
```

Supports 16 AI crawlers: GPTBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Amazonbot, CCBot, Google-Extended, FacebookBot, Bytespider, Applebot-Extended, cohere-ai, Diffbot, ImagesiftBot, Omgilibot, YouBot.

### sitemap.xml

Standard sitemap with optional changefreq and priority:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
  </url>
</urlset>
```

### JSON-LD

Generate structured data for any page:

```typescript
import { generateJsonLd } from '@glincker/geo-seo';

const orgSchema = generateJsonLd('Organization', config);
// { "@context": "https://schema.org", "@type": "Organization", ... }

const faqSchema = generateJsonLd('FAQPage', config, faqPage);
// { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...] }
```

Supported types: `Organization`, `WebSite`, `WebPage`, `Article`, `BlogPosting`, `FAQPage`, `Product`, `BreadcrumbList`.

## AI Crawler Modes

Control which AI crawlers can access your site:

```typescript
// Allow all AI crawlers (default)
robots: { aiCrawlers: 'allow' }

// Block all AI crawlers
robots: { aiCrawlers: 'block' }

// Selective: allow some, block others
robots: {
  aiCrawlers: 'selective',
  allow: ['GPTBot', 'ClaudeBot', 'PerplexityBot'],
  block: ['Bytespider', 'CCBot'],
}
```

You can also add custom rules and crawl delays:

```typescript
robots: {
  aiCrawlers: 'allow',
  crawlDelay: 2,
  customRules: [
    { userAgent: 'BadBot', disallow: ['/'] },
  ],
}
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `geo-seo generate` | Generate all GEO assets |
| `geo-seo init` | Create a starter config file |
| `geo-seo validate` | Validate your config file |

## CLI Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--out <dir>` | `-o` | Output directory (default: `./public`) |
| `--only <type>` | | Generate only: `llms-txt`, `robots-txt`, `sitemap` |
| `--config <path>` | `-c` | Path to config file (default: `geo-seo.config.ts`) |
| `--help` | `-h` | Show help message |
| `--version` | `-v` | Show version |

## Programmatic API

Use GeoSEO in your build pipeline:

```typescript
import {
  defineConfig,
  generateAll,
  generateLlmsTxt,
  generateRobotsTxt,
  generateSitemap,
  generateJsonLd,
  validateConfig,
} from '@glincker/geo-seo';

// Define config with type safety
const config = defineConfig({
  site: { name: 'My Site', url: 'https://example.com', description: '...' },
  pages: [{ path: '/', title: 'Home', description: '...' }],
});

// Validate before generating
const errors = validateConfig(config);
if (errors.length > 0) {
  console.error('Config errors:', errors);
  process.exit(1);
}

// Generate all files to output directory
const result = await generateAll(config);
console.log(`Generated ${result.count} files`);

// Or generate individual assets as strings
const llmsTxt = generateLlmsTxt(config);
const robotsTxt = generateRobotsTxt(config);
const sitemap = generateSitemap(config);
const jsonLd = generateJsonLd('Organization', config);
```

## Config File Formats

GeoSEO looks for config files in this order:

1. `geo-seo.config.ts`
2. `geo-seo.config.js`
3. `geo-seo.config.mjs`
4. `geo-seo.config.json`

Or specify a custom path with `--config`:

```bash
geo-seo generate --config ./my-config.ts
```

## CI/CD Integration

Run GeoSEO as part of your build:

```yaml
# .github/workflows/build.yml
- name: Generate GEO assets
  run: npx @glincker/geo-seo generate --out ./public

- name: Verify GEO score
  run: npx @glincker/geo-audit https://yourdomain.com --fail-under 80
```

## Framework Adapters

GeoSEO integrates with popular frameworks via subpath exports — no extra packages needed:

### Next.js

```typescript
// next.config.ts
import { withGeoSEO } from '@glincker/geo-seo/next';
export default withGeoSEO(geoConfig)({ reactStrictMode: true });
```

### Vite (Vue / Svelte / Remix / SolidStart)

```typescript
// vite.config.ts
import { geoSeoPlugin } from '@glincker/geo-seo/vite';
export default defineConfig({ plugins: [geoSeoPlugin(geoConfig)] });
```

### Astro

```typescript
// astro.config.mjs
import { geoSeoIntegration } from '@glincker/geo-seo/astro';
export default defineConfig({ integrations: [geoSeoIntegration(geoConfig)] });
```

### Nuxt

```typescript
// nuxt.config.ts
import { geoSeoModule } from '@glincker/geo-seo/nuxt';
export default defineNuxtConfig({ modules: [geoSeoModule(geoConfig)] });
```

All adapters also export `getJsonLdScript()` for page-level JSON-LD generation:

```typescript
import { getJsonLdScript } from '@glincker/geo-seo/vite'; // or /next, /astro, /nuxt
const jsonLd = getJsonLdScript('WebPage', geoConfig, page);
// Use in <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
```

## How It Connects to GeoKit

GeoSEO is one part of the [GeoKit](https://github.com/glincker/geokit) toolkit:

1. **geo-audit** — Audit your site's AI-readiness (score 0-100)
2. **geo-seo** — Generate the files that improve your score
3. **geomark** — Convert URLs to clean markdown for LLM context

Typical workflow:
```
Run geo-audit -> Score 45/100
  -> Install geo-seo -> Generate llms.txt + robots.txt + sitemap
  -> Run geo-audit again -> Score 85/100
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Links

- **Website**: [geo.glincker.com](https://geo.glincker.com)
- **GitHub**: [github.com/glincker/geokit](https://github.com/glincker/geokit)
- **Issues**: [github.com/glincker/geokit/issues](https://github.com/glincker/geokit/issues)
- **npm**: [npmjs.com/package/@glincker/geo-seo](https://www.npmjs.com/package/@glincker/geo-seo)

---

Made by [Glincker](https://glincker.com) | [geo.glincker.com](https://geo.glincker.com)
