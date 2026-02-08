# Security Policy

## Supported Versions

We actively support the following versions of GeoKit with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue in GeoKit, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at: **security@glincker.com**

Include the following information in your report:
- Description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact
- Any proof-of-concept code (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Assessment**: We will assess the vulnerability and determine its severity within 5 business days.
- **Fix Timeline**:
  - **Critical vulnerabilities**: Patched within 7 days
  - **High severity**: Patched within 14 days
  - **Medium/Low severity**: Patched in the next scheduled release
- **Updates**: We will keep you informed of our progress throughout the process.
- **Disclosure**: Once a fix is released, we will publish a security advisory. We will coordinate the disclosure timeline with you.

### Credit Policy

We believe in recognizing security researchers for their contributions:
- We will credit you in the CHANGELOG and security advisory (unless you prefer to remain anonymous)
- We will acknowledge your responsible disclosure in our communications
- You may choose how you want to be credited (name, handle, organization, or anonymous)

### Scope

This security policy applies to:
- The `@glincker/geo-audit` CLI package
- Any hosted services at `geo.glincker.com`
- Supporting infrastructure and APIs

### Out of Scope

The following are generally out of scope:
- Vulnerabilities in third-party dependencies (please report these upstream, but do let us know)
- Social engineering attacks
- Denial of Service attacks against our hosted services
- Issues requiring physical access to a user's device

### Security Best Practices

When using GeoKit:
- Always use the `--insecure` flag cautiously and only when necessary
- Be aware that the CLI will make network requests to the URLs you provide
- Keep your installation up to date with the latest version
- Review the audit results before sharing them publicly, as they may contain sensitive information about your site

## Security Features

GeoKit includes several built-in security features:
- **SSRF Protection**: Blocks requests to internal/private IP addresses by default
- **HTTPS Enforcement**: Validates SSL certificates by default (can be disabled with `--insecure`)
- **Input Validation**: Validates all URLs before processing
- **Safe Parsing**: Uses secure HTML parsing with JSDOM

Thank you for helping keep GeoKit and our users safe!
