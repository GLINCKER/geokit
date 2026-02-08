import type { GeoSeoConfig, JsonLdOutput, JsonLdType, PageEntry } from "../types.js";

/**
 * Generate a JSON-LD object for a given schema type.
 */
export function generateJsonLd(
  type: JsonLdType,
  config: GeoSeoConfig,
  page?: PageEntry,
): JsonLdOutput {
  switch (type) {
    case "Organization":
      return generateOrganization(config);
    case "WebSite":
      return generateWebSite(config);
    case "WebPage":
      return generateWebPage(config, page);
    case "Article":
    case "BlogPosting":
      return generateArticle(type, config, page);
    case "FAQPage":
      return generateFaqPage(config, page);
    case "Product":
      return generateProduct(config, page);
    case "BreadcrumbList":
      return generateBreadcrumbs(config, page);
    default:
      return generateWebPage(config, page);
  }
}

function generateOrganization(config: GeoSeoConfig): JsonLdOutput {
  const org = config.organization;
  const site = config.site;

  const result: JsonLdOutput = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org?.name ?? site.name,
    url: org?.url ?? site.url,
  };

  if (org?.logo ?? site.logo) {
    result.logo = org?.logo ?? `${site.url.replace(/\/+$/, "")}${site.logo}`;
  }

  if (org?.sameAs?.length) {
    result.sameAs = org.sameAs;
  }

  if (org?.contactPoint) {
    result.contactPoint = {
      "@type": org.contactPoint.type,
      ...(org.contactPoint.telephone && { telephone: org.contactPoint.telephone }),
      ...(org.contactPoint.email && { email: org.contactPoint.email }),
    };
  }

  return result;
}

function generateWebSite(config: GeoSeoConfig): JsonLdOutput {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.site.name,
    url: config.site.url,
    description: config.site.description,
  };
}

function generateWebPage(config: GeoSeoConfig, page?: PageEntry): JsonLdOutput {
  const url = page
    ? `${config.site.url.replace(/\/+$/, "")}${page.path}`
    : config.site.url;

  const result: JsonLdOutput = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page?.title ?? config.site.name,
    url,
    description: page?.description ?? config.site.description,
  };

  if (page?.schemaProps) {
    Object.assign(result, page.schemaProps);
  }

  return result;
}

function generateArticle(
  type: "Article" | "BlogPosting",
  config: GeoSeoConfig,
  page?: PageEntry,
): JsonLdOutput {
  const url = page
    ? `${config.site.url.replace(/\/+$/, "")}${page.path}`
    : config.site.url;

  const result: JsonLdOutput = {
    "@context": "https://schema.org",
    "@type": type,
    headline: page?.title ?? config.site.name,
    url,
    description: page?.description ?? config.site.description,
  };

  if (page?.lastmod) {
    result.dateModified = page.lastmod;
  }

  if (page?.schemaProps) {
    Object.assign(result, page.schemaProps);
  }

  if (config.organization) {
    result.publisher = {
      "@type": "Organization",
      name: config.organization.name,
      ...(config.organization.logo && { logo: config.organization.logo }),
    };
  }

  return result;
}

function generateFaqPage(config: GeoSeoConfig, page?: PageEntry): JsonLdOutput {
  const result: JsonLdOutput = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: page?.title ?? config.site.name,
    url: page
      ? `${config.site.url.replace(/\/+$/, "")}${page.path}`
      : config.site.url,
  };

  // FAQ items come from schemaProps.questions
  if (page?.schemaProps?.questions && Array.isArray(page.schemaProps.questions)) {
    result.mainEntity = (page.schemaProps.questions as Array<{ question: string; answer: string }>).map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    }));
  }

  return result;
}

function generateProduct(config: GeoSeoConfig, page?: PageEntry): JsonLdOutput {
  const result: JsonLdOutput = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: page?.title ?? config.site.name,
    description: page?.description ?? config.site.description,
    url: page
      ? `${config.site.url.replace(/\/+$/, "")}${page.path}`
      : config.site.url,
  };

  if (page?.schemaProps) {
    Object.assign(result, page.schemaProps);
  }

  return result;
}

function generateBreadcrumbs(config: GeoSeoConfig, page?: PageEntry): JsonLdOutput {
  const baseUrl = config.site.url.replace(/\/+$/, "");
  const items: Array<{ "@type": string; position: number; name: string; item: string }> = [];

  // Always include home
  items.push({
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: baseUrl,
  });

  if (page && page.path !== "/") {
    const segments = page.path.split("/").filter(Boolean);
    let currentPath = "";
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      items.push({
        "@type": "ListItem",
        position: i + 2,
        name: i === segments.length - 1 ? page.title : capitalize(segments[i]!),
        item: `${baseUrl}${currentPath}`,
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}
