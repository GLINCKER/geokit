# Changelog

All notable changes to `@glincker/geomark` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-07

### Added
- Initial release of `@glincker/geomark`
- **URL to markdown conversion** via Mozilla Readability + Turndown
  - Strips navigation, sidebars, footers, ads, and cookie banners
  - ATX headings, fenced code blocks, inlined links
  - Tracking pixel and beacon removal
  - Excessive whitespace normalization
- **Metadata extraction** via Cheerio
  - Open Graph tags (title, description, image, type, site_name)
  - JSON-LD structured data (first script block)
  - Meta tags (description, author)
  - Article tags (published_time, author)
  - Canonical URL and language detection
- **Token estimation** for LLM developers
  - Dual heuristic: character-based (~4 chars/token) + word-based (~0.75 words/token)
  - Word count and reading time estimation
- **CLI** with URL argument and STDIN support
  - `--json` for full metadata output
  - `--frontmatter` for YAML frontmatter in markdown
  - `--output` to save to file
  - `--timeout` for custom request timeout
  - Pipe support: `echo "url" | geomark`
- **YAML frontmatter generation** with title, URL, author, date, description, tokens
- **SSRF protection** — blocks private/internal IP ranges
- Graceful error handling for DNS failures, timeouts, and blocked hosts
- SIGINT signal handling (clean Ctrl+C)
- NO_COLOR environment variable support
- Spinner animation during fetch
- Dual ESM + CJS package format
- TypeScript support with full type definitions

### Security
- SSRF protection against internal/private IP ranges (127.x, 10.x, 172.16-31.x, 192.168.x, localhost, ::1)
- No JavaScript execution — uses linkedom, not a headless browser
- Configurable request timeout (default 10s)
