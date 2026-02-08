import TurndownService from "turndown";

let turndownInstance: TurndownService | null = null;

function getTurndown(): TurndownService {
  if (!turndownInstance) {
    turndownInstance = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
    });

    // Remove images with empty alt text or tracking pixels
    turndownInstance.addRule("removeTrackingImages", {
      filter: (node) => {
        if (node.nodeName !== "IMG") return false;
        const src = node.getAttribute("src") ?? "";
        const width = parseInt(node.getAttribute("width") ?? "999", 10);
        const height = parseInt(node.getAttribute("height") ?? "999", 10);
        // Remove 1x1 tracking pixels
        return (width <= 1 && height <= 1) || src.includes("pixel") || src.includes("beacon");
      },
      replacement: () => "",
    });

    // Clean up excessive whitespace
    turndownInstance.addRule("cleanWhitespace", {
      filter: ["script", "style", "noscript"],
      replacement: () => "",
    });
  }
  return turndownInstance;
}

/**
 * Convert HTML content to clean markdown.
 */
export function htmlToMarkdown(html: string): string {
  const turndown = getTurndown();
  let markdown = turndown.turndown(html);

  // Clean up excessive blank lines (more than 2 consecutive)
  markdown = markdown.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing whitespace
  markdown = markdown.trim();

  return markdown;
}

/**
 * Generate markdown frontmatter from metadata.
 */
export function generateFrontmatter(data: Record<string, string | number>): string {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== "") {
      if (typeof value === "string" && (value.includes(":") || value.includes('"'))) {
        lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
  }
  lines.push("---");
  return lines.join("\n");
}
