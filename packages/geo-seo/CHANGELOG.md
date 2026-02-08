# Changelog

All notable changes to `@glincker/geo-seo` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-07

### Added
- Initial release of `@glincker/geo-seo`
- CLI with `generate`, `init`, and `validate` commands
- **llms.txt generator** following [llmstxt.org](https://llmstxt.org) specification
  - Site header with name and description
  - Page entries grouped by section
- **robots.txt generator** with AI crawler rules
  - 3 modes: `allow`, `block`, `selective`
  - 16 known AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
  - Custom rules and crawl delay support
  - Auto-appends sitemap URL
- **sitemap.xml generator** with changefreq and priority
  - Standard sitemap protocol
  - XML entity escaping
- **JSON-LD generator** for 8 Schema.org types
  - Organization, WebSite, WebPage, Article, BlogPosting, FAQPage, Product, BreadcrumbList
  - Publisher attribution from organization config
  - FAQ mainEntity generation from question/answer pairs
- `defineConfig()` helper for type-safe configuration
- `validateConfig()` with detailed error messages
- Config file auto-discovery: `.ts`, `.js`, `.mjs`, `.json`
- CLI flags: `--out`, `--only`, `--config`, `--help`, `--version`
- Short flags: `-o`, `-c`, `-h`, `-v`
- NO_COLOR environment variable support
- Spinner animation during generation
- Dual ESM + CJS package format
- TypeScript support with full type definitions
