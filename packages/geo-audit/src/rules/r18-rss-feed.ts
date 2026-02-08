import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R18: Check for RSS/Atom feed links */
export const r18RssFeed: Rule = {
  id: "R18",
  name: "RSS/Atom Feed Detection",
  description: "Check for discoverable RSS or Atom feed links in HTML head",
  category: "discoverability",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const feedLinks = $('link[rel="alternate"]');

    if (feedLinks.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "fail",
        score: 0,
        maxScore: this.maxScore,
        message: "No feed link found",
        recommendation:
          'Add <link rel="alternate" type="application/rss+xml" href="/feed.xml"> to make your content discoverable via feeds.',
      };
    }

    const rssFeeds: string[] = [];
    const atomFeeds: string[] = [];
    const otherFeeds: string[] = [];

    feedLinks.each((_, el) => {
      const type = $(el).attr("type");
      const href = $(el).attr("href");

      if (type === "application/rss+xml" && href) {
        rssFeeds.push(href);
      } else if (type === "application/atom+xml" && href) {
        atomFeeds.push(href);
      } else if (href) {
        otherFeeds.push(href);
      }
    });

    const validFeeds = rssFeeds.length + atomFeeds.length;

    if (validFeeds > 0) {
      const feedTypes = [];
      if (rssFeeds.length > 0) feedTypes.push(`RSS (${rssFeeds.length})`);
      if (atomFeeds.length > 0) feedTypes.push(`Atom (${atomFeeds.length})`);

      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 5,
        maxScore: this.maxScore,
        message: `Feed link(s) found: ${feedTypes.join(", ")}`,
        details: { rssFeeds, atomFeeds },
      };
    }

    if (otherFeeds.length > 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: "Feed link found but missing or incorrect type attribute",
        recommendation:
          'Set type="application/rss+xml" or type="application/atom+xml" on feed link elements.',
        details: { otherFeeds },
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
      message: "No valid feed link found",
      recommendation:
        'Add <link rel="alternate" type="application/rss+xml" href="/feed.xml"> for content discoverability.',
    };
  },
};
