import * as cheerio from "cheerio";
import type { Rule, PageData, RuleResult } from "../types.js";

const KEY_PROPERTIES = [
  "name",
  "description",
  "image",
  "url",
  "datePublished",
  "dateModified",
  "author",
  "publisher",
  "headline",
  "mainEntityOfPage",
  "aggregateRating",
  "review",
  "offers",
  "price",
  "availability",
  "brand",
  "sku",
  "address",
  "telephone",
  "email",
  "openingHours",
  "geo",
  "sameAs",
  "logo",
  "contactPoint",
];

interface SchemaAnalysis {
  types: string[];
  totalProperties: number;
  keyProperties: string[];
  maxNesting: number;
}

function analyzeSchema(obj: unknown, depth = 0): SchemaAnalysis {
  const analysis: SchemaAnalysis = {
    types: [],
    totalProperties: 0,
    keyProperties: [],
    maxNesting: depth,
  };

  if (typeof obj !== "object" || obj === null) {
    return analysis;
  }

  // Handle arrays (including @graph)
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const itemAnalysis = analyzeSchema(item, depth);
      analysis.types.push(...itemAnalysis.types);
      analysis.totalProperties += itemAnalysis.totalProperties;
      analysis.keyProperties.push(...itemAnalysis.keyProperties);
      analysis.maxNesting = Math.max(analysis.maxNesting, itemAnalysis.maxNesting);
    }
    return analysis;
  }

  // Handle objects
  const record = obj as Record<string, unknown>;

  for (const [key, value] of Object.entries(record)) {
    // Skip @-prefixed keys except collect @type
    if (key.startsWith("@")) {
      if (key === "@type" && typeof value === "string") {
        analysis.types.push(value);
      }
      continue;
    }

    // Count this property
    analysis.totalProperties++;

    // Check if it's a key property
    if (KEY_PROPERTIES.includes(key)) {
      analysis.keyProperties.push(key);
    }

    // Recurse for nested objects/arrays
    if (typeof value === "object" && value !== null) {
      const nested = analyzeSchema(value, depth + 1);
      analysis.types.push(...nested.types);
      analysis.totalProperties += nested.totalProperties;
      analysis.keyProperties.push(...nested.keyProperties);
      analysis.maxNesting = Math.max(analysis.maxNesting, nested.maxNesting);
    }
  }

  return analysis;
}

/** R25: Score richness of JSON-LD structured data */
export const r25SchemaDepth: Rule = {
  id: "R25",
  name: "Schema Depth",
  description: "Score richness of JSON-LD beyond basic presence",
  category: "structured-data",
  maxScore: 8,

  check(page: PageData): RuleResult {
    const $ = cheerio.load(page.html);
    const scripts = $('script[type="application/ld+json"]');

    if (scripts.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "skip",
        score: 0,
        maxScore: this.maxScore,
        message: "No JSON-LD found (R04 handles basic check)",
      };
    }

    const combinedAnalysis: SchemaAnalysis = {
      types: [],
      totalProperties: 0,
      keyProperties: [],
      maxNesting: 0,
    };

    // Parse and analyze all JSON-LD blocks
    scripts.each((_i, el) => {
      const text = $(el).text().trim();
      if (!text) return;

      try {
        const data = JSON.parse(text);
        const analysis = analyzeSchema(data);
        combinedAnalysis.types.push(...analysis.types);
        combinedAnalysis.totalProperties += analysis.totalProperties;
        combinedAnalysis.keyProperties.push(...analysis.keyProperties);
        combinedAnalysis.maxNesting = Math.max(
          combinedAnalysis.maxNesting,
          analysis.maxNesting,
        );
      } catch {
        // Skip malformed JSON
      }
    });

    // Deduplicate types and key properties
    const uniqueTypes = [...new Set(combinedAnalysis.types)];
    const uniqueKeyProps = [...new Set(combinedAnalysis.keyProperties)];

    if (uniqueTypes.length === 0) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "skip",
        score: 0,
        maxScore: this.maxScore,
        message: "No valid @type found in JSON-LD",
      };
    }

    const details = {
      types: uniqueTypes,
      totalProperties: combinedAnalysis.totalProperties,
      keyProperties: uniqueKeyProps,
      maxNesting: combinedAnalysis.maxNesting,
    };

    // 1 type, <5 props
    if (uniqueTypes.length === 1 && combinedAnalysis.totalProperties < 5) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 2,
        maxScore: this.maxScore,
        message: "Shallow schema (1 type, <5 properties)",
        recommendation:
          "Enrich your JSON-LD with more properties (description, image, author, etc.)",
        details,
      };
    }

    // 1 type, 5-9 props
    if (uniqueTypes.length === 1 && combinedAnalysis.totalProperties < 10) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "warn",
        score: 4,
        maxScore: this.maxScore,
        message: "Moderate schema (1 type, 5-9 properties)",
        recommendation:
          "Consider adding more schema types or properties for richer data",
        details,
      };
    }

    // 3+ types AND 10+ props AND 5+ key props
    if (
      uniqueTypes.length >= 3 &&
      combinedAnalysis.totalProperties >= 10 &&
      uniqueKeyProps.length >= 5
    ) {
      return {
        id: this.id,
        name: this.name,
        description: this.description,
        category: this.category,
        status: "pass",
        score: 8,
        maxScore: this.maxScore,
        message: `Rich schema (${uniqueTypes.length} types, ${combinedAnalysis.totalProperties} properties, ${uniqueKeyProps.length} key)`,
        details,
      };
    }

    // 2+ types or 10+ props (but not meeting rich criteria)
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      status: "pass",
      score: 6,
      maxScore: this.maxScore,
      message: `Good schema (${uniqueTypes.length} types, ${combinedAnalysis.totalProperties} properties)`,
      recommendation:
        "Add more key properties (name, description, image, author, etc.) for maximum richness",
      details,
    };
  },
};
