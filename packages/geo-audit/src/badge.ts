import type { AuditResult, Grade } from "./types.js";

/** Badge snippet URLs for embedding */
export interface BadgeSnippets {
  /** shields.io dynamic badge URL (auto-updates via Worker API) */
  dynamic: string;
  /** shields.io static badge URL (current score snapshot) */
  static: string;
  /** HTML img tag for static badge */
  html: string;
}

const WORKER_BASE = "https://geo-badge.glincker.workers.dev";
const LANDING = "https://geo.glincker.com";

/** Map grade to shields.io color */
export function gradeToColor(grade: Grade): string {
  switch (grade) {
    case "A":
      return "brightgreen";
    case "B":
      return "green";
    case "C":
      return "yellow";
    case "D":
      return "orange";
    case "F":
      return "red";
  }
}

/** Extract hostname from a URL string */
function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    // Already a bare hostname
    return url.replace(/^https?:\/\//, "").split("/")[0] ?? url;
  }
}

/** Generate badge snippet URLs from an audit result */
export function formatBadge(result: AuditResult): BadgeSnippets {
  const color = gradeToColor(result.grade);
  const label = "AI--Ready";
  const message = `${result.score}%20(${result.grade})`;
  const hostname = extractHostname(result.url);

  const dynamicUrl = `https://img.shields.io/endpoint?url=${encodeURIComponent(`${WORKER_BASE}/?url=${hostname}`)}`;
  const staticUrl = `https://img.shields.io/badge/${label}-${message}-${color}`;

  return {
    dynamic: dynamicUrl,
    static: staticUrl,
    html: `<a href="${LANDING}"><img alt="AI-Ready: ${result.score} (${result.grade})" src="${staticUrl}"></a>`,
  };
}
