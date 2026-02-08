import type { Rule } from "../types.js";
import { r01LlmsTxt } from "./r01-llms-txt.js";
import { r02RobotsTxt } from "./r02-robots-txt.js";
import { r03Sitemap } from "./r03-sitemap.js";
import { r04JsonLd } from "./r04-json-ld.js";
import { r05OpenGraph } from "./r05-opengraph.js";
import { r06MetaDescription } from "./r06-meta-description.js";
import { r07Canonical } from "./r07-canonical.js";
import { r08Headings } from "./r08-headings.js";
import { r09SsrContent } from "./r09-ssr-content.js";
import { r10Faq } from "./r10-faq.js";
import { r11ResponseTime } from "./r11-response-time.js";
import { r12ContentType } from "./r12-content-type.js";
import { r13LangTag } from "./r13-lang-tag.js";
import { r14Https } from "./r14-https.js";
import { r15AltText } from "./r15-alt-text.js";
import { r16SemanticHtml } from "./r16-semantic-html.js";
import { r17IdentitySchema } from "./r17-identity-schema.js";
import { r18RssFeed } from "./r18-rss-feed.js";
import { r19LlmsQuality } from "./r19-llms-quality.js";
import { r20Viewport } from "./r20-viewport.js";

/** All audit rules in order */
export const allRules: Rule[] = [
  // AI Discoverability (40 pts)
  r01LlmsTxt,
  r02RobotsTxt,
  r03Sitemap,
  r18RssFeed,
  r19LlmsQuality,
  // Structured Data (35 pts)
  r04JsonLd,
  r05OpenGraph,
  r06MetaDescription,
  r07Canonical,
  r17IdentitySchema,
  // Content Quality (38 pts)
  r08Headings,
  r09SsrContent,
  r10Faq,
  r13LangTag,
  r15AltText,
  r16SemanticHtml,
  // Technical AI-Readiness (21 pts)
  r11ResponseTime,
  r12ContentType,
  r14Https,
  r20Viewport,
];

export {
  r01LlmsTxt,
  r02RobotsTxt,
  r03Sitemap,
  r04JsonLd,
  r05OpenGraph,
  r06MetaDescription,
  r07Canonical,
  r08Headings,
  r09SsrContent,
  r10Faq,
  r11ResponseTime,
  r12ContentType,
  r13LangTag,
  r14Https,
  r15AltText,
  r16SemanticHtml,
  r17IdentitySchema,
  r18RssFeed,
  r19LlmsQuality,
  r20Viewport,
};
