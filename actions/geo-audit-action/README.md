# GEO Audit — GitHub Action

Audit any website's AI-readiness score in your CI/CD pipeline. Scores 20 rules across discoverability, structured data, content quality, and technical readiness. Returns a 0-100 score and A-F grade.

## Quick Start

```yaml
- uses: GLINCKER/geo-audit-action@v1
  with:
    url: https://your-site.com
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `url` | **Yes** | — | URL to audit |
| `fail-under` | No | `0` | Fail the step if score is below this threshold |
| `comment` | No | `false` | Post score as a PR comment (updates existing comment) |
| `badge` | No | `false` | Include badge markdown snippet in job summary |
| `timeout` | No | `15000` | Fetch timeout in milliseconds |
| `version` | No | `latest` | Pin to a specific `@glincker/geo-audit` version |

## Outputs

| Output | Description | Example |
|--------|-------------|---------|
| `score` | Numeric score (0-100) | `85` |
| `grade` | Letter grade | `A` |
| `badge` | Static shields.io badge URL | `https://img.shields.io/badge/...` |
| `result` | Full JSON audit result | `{"url":"...","score":85,...}` |

## Features

- **Job Summary** — Rich markdown report in the Actions tab (always on)
- **PR Comments** — Auto-posts score on pull requests, updates existing comment (no spam)
- **Badge Output** — Generates shields.io badge URL as an output
- **Threshold Gate** — Fail CI if score drops below a minimum
- **Version Pinning** — Lock to a specific audit version for reproducible builds

## Examples

### Basic PR Check with Threshold

```yaml
name: AI-Readiness
on: pull_request

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: GLINCKER/geo-audit-action@v1
        with:
          url: https://your-site.com
          fail-under: 60
```

### PR Comment with Badge

```yaml
name: AI-Readiness Report
on: pull_request

permissions:
  pull-requests: write

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: GLINCKER/geo-audit-action@v1
        with:
          url: https://your-site.com
          comment: true
          badge: true
```

### Audit Deploy Preview

```yaml
name: Audit Preview
on:
  deployment_status:
    types: [success]

jobs:
  audit:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: GLINCKER/geo-audit-action@v1
        with:
          url: ${{ github.event.deployment_status.target_url }}
          fail-under: 50
```

### Weekly Scheduled Audit

```yaml
name: Weekly AI-Readiness
on:
  schedule:
    - cron: '0 9 * * 1'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: GLINCKER/geo-audit-action@v1
        id: geo
        with:
          url: https://your-site.com

      - name: Alert if score drops
        if: steps.geo.outputs.score < 70
        run: echo "::warning::AI-Readiness score dropped to ${{ steps.geo.outputs.score }}"
```

### Use Score in Downstream Steps

```yaml
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: GLINCKER/geo-audit-action@v1
        id: geo
        with:
          url: https://your-site.com

      - name: Use results
        run: |
          echo "Score: ${{ steps.geo.outputs.score }}"
          echo "Grade: ${{ steps.geo.outputs.grade }}"
          echo "Badge: ${{ steps.geo.outputs.badge }}"
```

## Grading Scale

| Grade | Score | Color |
|-------|-------|-------|
| A | 90-100 | brightgreen |
| B | 75-89 | green |
| C | 60-74 | yellow |
| D | 40-59 | orange |
| F | 0-39 | red |

## Publishing to Marketplace

This action is designed for GitHub Marketplace. To publish:

1. Create a dedicated repo: `GLINCKER/geo-audit-action`
2. Copy `action.yml` and `README.md` to the repo root
3. Go to the repo on GitHub, navigate to `action.yml`
4. Click **"Draft a release"** → check **"Publish this Action to the GitHub Marketplace"**
5. Choose category: **Code quality** (primary), **Continuous integration** (secondary)
6. Tag as `v1.0.0`, create release

Users then reference it as:
```yaml
uses: GLINCKER/geo-audit-action@v1
```

## Links

- [GEO Audit Rules](https://geo.glincker.com)
- [npm: @glincker/geo-audit](https://www.npmjs.com/package/@glincker/geo-audit)
- [GeoKit Monorepo](https://github.com/GLINCKER/geokit)
