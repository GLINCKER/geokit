import type { Rule, PageData, RuleResult } from "../types.js";

/** R03: Check if sitemap.xml exists */
export const r03Sitemap: Rule = {
  id: "R03",
  name: "Sitemap.xml Exists",
  description: "Check for XML sitemap for AI crawler discovery",
  category: "discoverability",
  maxScore: 10,

  check(page: PageData): RuleResult {
    const { sitemapXml, robotsTxt } = page;

    // Check robots.txt for Sitemap directive
    let sitemapInRobots = false;
    if (robotsTxt.ok) {
      sitemapInRobots = /^sitemap:\s*https?:\/\//im.test(robotsTxt.body);
    }

    const sitemapExists = sitemapXml.ok && sitemapXml.status === 200;
    const isXml =
      sitemapExists &&
      (sitemapXml.body.includes("<?xml") ||
        sitemapXml.body.includes("<urlset") ||
        sitemapXml.body.includes("<sitemapindex"));

    if (isXml) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 10,
        maxScore: this.maxScore,
        message: "Valid XML sitemap found",
        details: { sitemapInRobots },
      };
    }

    if (sitemapInRobots) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 5,
        maxScore: this.maxScore,
        message:
          "Sitemap referenced in robots.txt but /sitemap.xml not directly accessible",
        recommendation:
          "Ensure your sitemap.xml is accessible at the root URL for maximum crawler compatibility.",
      };
    }

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "fail",
      score: 0,
      maxScore: this.maxScore,
      message: "No sitemap.xml found",
      recommendation:
        "Add a sitemap.xml to help AI crawlers discover all your pages.",
    };
  },
};
