import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

/** R15: Check image alt text coverage */
export const r15AltText: Rule = {
  id: "R15",
  name: "Image Alt Text Coverage",
  description: "Check that images have descriptive alt text for accessibility and AI parsing",
  category: "content-quality",
  maxScore: 5,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const images = $("img");

    // Filter out decorative images first
    const contentImages: any[] = [];
    images.each((_, el) => {
      const $el = $(el);
      const role = $el.attr("role");

      // Skip decorative images (role="presentation")
      if (role !== "presentation") {
        contentImages.push($el);
      }
    });

    if (contentImages.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 5,
        maxScore: this.maxScore,
        message: "No images found on page",
        details: { totalImages: 0, imagesWithAlt: 0, percentage: 100 },
      };
    }

    let imagesWithAlt = 0;
    contentImages.forEach(($el) => {
      const alt = $el.attr("alt");

      // Count as having alt text if alt attribute exists and is not empty
      if (alt !== undefined && alt.trim() !== "") {
        imagesWithAlt++;
      }
    });

    const percentage = Math.round((imagesWithAlt / contentImages.length) * 100);

    if (percentage >= 90) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 5,
        maxScore: this.maxScore,
        message: `${imagesWithAlt} of ${contentImages.length} images have alt text (${percentage}%)`,
        details: { totalImages: contentImages.length, imagesWithAlt, percentage },
      };
    }

    if (percentage >= 50) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 3,
        maxScore: this.maxScore,
        message: `Only ${imagesWithAlt} of ${contentImages.length} images have alt text (${percentage}%)`,
        recommendation:
          "Add descriptive alt text to all images. Alt text helps screen readers, SEO, and AI systems understand your images.",
        details: { totalImages: contentImages.length, imagesWithAlt, percentage },
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
      message: `Only ${imagesWithAlt} of ${contentImages.length} images have alt text (${percentage}%)`,
      recommendation:
        "Add descriptive alt text to all images. This is critical for accessibility and helps AI systems understand your content.",
      details: { totalImages: contentImages.length, imagesWithAlt, percentage },
    };
  },
};
