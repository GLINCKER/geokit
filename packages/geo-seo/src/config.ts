import type { GeoSeoConfig } from "./types.js";

/**
 * Define a GEO-SEO configuration with type safety and defaults.
 */
export function defineConfig(config: GeoSeoConfig): GeoSeoConfig {
  const robots = config.robots ?? { aiCrawlers: "allow" as const };
  return {
    ...config,
    output: config.output ?? "./public",
    robots,
  };
}

/**
 * Validate a configuration object and return errors.
 */
export function validateConfig(config: GeoSeoConfig): string[] {
  const errors: string[] = [];

  if (!config.site) {
    errors.push("site is required");
  } else {
    if (!config.site.name) errors.push("site.name is required");
    if (!config.site.url) errors.push("site.url is required");
    if (!config.site.description) errors.push("site.description is required");

    if (config.site.url && !config.site.url.startsWith("http")) {
      errors.push("site.url must start with http:// or https://");
    }
  }

  if (!config.pages || !Array.isArray(config.pages)) {
    errors.push("pages must be an array");
  } else if (config.pages.length === 0) {
    errors.push("pages must have at least one entry");
  } else {
    for (let i = 0; i < config.pages.length; i++) {
      const page = config.pages[i]!;
      if (!page.path) errors.push(`pages[${i}].path is required`);
      if (!page.title) errors.push(`pages[${i}].title is required`);
      if (!page.description) errors.push(`pages[${i}].description is required`);
      if (page.priority !== undefined && (page.priority < 0 || page.priority > 1)) {
        errors.push(`pages[${i}].priority must be between 0.0 and 1.0`);
      }
    }
  }

  if (config.robots?.aiCrawlers === "selective") {
    if (!config.robots.allow?.length && !config.robots.block?.length) {
      errors.push("robots.allow or robots.block must be set when aiCrawlers is 'selective'");
    }
  }

  return errors;
}

/**
 * Generate a starter config file content.
 */
export function generateConfigTemplate(): string {
  return `import { defineConfig } from '@glincker/geo-seo';

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
  },
  pages: [
    { path: '/', title: 'Home', description: 'Welcome to our site', changefreq: 'daily', priority: 1.0 },
    { path: '/about', title: 'About', description: 'About us' },
    { path: '/blog', title: 'Blog', description: 'Latest posts', changefreq: 'weekly' },
  ],
  robots: {
    aiCrawlers: 'allow',
  },
  output: './public',
});
`;
}
