# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-07

### Added
- Initial release of `geo-audit` CLI
- 20 audit rules across 4 categories:
  - **AI Discoverability** (R01-R03, R18-R19): llms.txt, robots.txt AI rules, sitemap.xml, RSS/Atom feeds, llms.txt quality
  - **Structured Data** (R04-R07, R17): JSON-LD, OpenGraph, meta description, canonical URL, identity schema
  - **Content Quality** (R08-R10, R13, R15-R16): headings, SSR content, FAQ, lang tag, alt text, semantic HTML
  - **Technical AI-Readiness** (R11-R12, R14, R20): response time, content-type, HTTPS, viewport
- Scoring system: 0-100 normalized from 134 raw points, with letter grades (A/B/C/D/F)
- CLI flags: `--json`, `--verbose`, `--quiet`, `--fail-under`, `--timeout`, `--no-recommendations`, `--insecure`, `--debug`
- Short flags: `-j`, `-q`, `-h`, `-v`
- STDIN support: pipe URLs via stdin
- NO_COLOR and SIGINT signal handling
- SSRF protection (blocks internal/private IPs)
- Dual ESM + CJS package format
- 125 unit tests with comprehensive coverage
- TypeScript support with full type definitions
- Configurable timeout and SSL verification options

### Security
- SSRF protection against internal/private IP ranges
- HTTPS enforcement (with opt-out via `--insecure` flag)
- Input validation for URLs
- Safe HTML parsing with JSDOM
