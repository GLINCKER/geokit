#!/usr/bin/env node

import chalk from "chalk";
import { writeFile } from "node:fs/promises";
import type { GeomarkCliFlags } from "./types.js";
import { geomark } from "./geomark.js";
import { generateFrontmatter } from "./markdown.js";

const VERSION = "0.1.0";

function parseArgs(args: string[]): GeomarkCliFlags {
  const flags: GeomarkCliFlags = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i]!;

    switch (arg) {
      case "--help":
      case "-h":
        flags.help = true;
        break;
      case "--version":
      case "-v":
      case "-V":
        flags.version = true;
        break;
      case "--json":
      case "-j":
        flags.json = true;
        break;
      case "--frontmatter":
      case "-f":
        flags.frontmatter = true;
        break;
      case "--output":
      case "-o":
        i++;
        flags.output = args[i];
        break;
      case "--timeout": {
        i++;
        const val = args[i];
        if (val === undefined || isNaN(Number(val))) {
          console.error(chalk.red("Error: --timeout requires a numeric value"));
          process.exit(1);
        }
        flags.timeout = Number(val);
        break;
      }
      default:
        if (!arg.startsWith("-")) {
          flags.url = arg;
        } else {
          console.error(chalk.red(`Unknown flag: ${arg}`));
          process.exit(1);
        }
    }
    i++;
  }

  return flags;
}

function printHelp(): void {
  console.log(`
${chalk.bold("geomark")} — Convert any URL to clean markdown with metadata

${chalk.dim("USAGE")}
  geomark <url> [options]
  echo "https://example.com" | geomark [options]

${chalk.dim("OPTIONS")}
  ${chalk.cyan("-o, --output <file>")}  Save to file instead of stdout
  ${chalk.cyan("-j, --json")}           Output as JSON with metadata
  ${chalk.cyan("-f, --frontmatter")}    Include YAML frontmatter in markdown output
  ${chalk.cyan("--timeout <ms>")}       Request timeout (default: 10000)
  ${chalk.cyan("-h, --help")}           Show this help message
  ${chalk.cyan("-v, --version")}        Show version

${chalk.dim("EXAMPLES")}
  geomark https://example.com/blog/post
  geomark https://example.com -o article.md
  geomark https://example.com --json
  geomark https://example.com --frontmatter

${chalk.dim("Powered by GeoKit — geo.glincker.com")}
`);
}

async function main(): Promise<void> {
  if (process.env.NO_COLOR !== undefined || process.env.FORCE_COLOR === "0") {
    chalk.level = 0;
  }

  const args = process.argv.slice(2);
  const flags = parseArgs(args);

  if (flags.version) {
    console.log(VERSION);
    return;
  }

  if (flags.help) {
    printHelp();
    return;
  }

  // STDIN support
  if (!flags.url && !process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    flags.url = Buffer.concat(chunks).toString().trim();
  }

  if (!flags.url) {
    printHelp();
    return;
  }

  // Spinner
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIdx = 0;
  const spinnerInterval = setInterval(() => {
    process.stderr.write(`\r${chalk.cyan(frames[frameIdx % frames.length])} Fetching ${flags.url}...`);
    frameIdx++;
  }, 80);

  process.on("SIGINT", () => {
    clearInterval(spinnerInterval);
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    process.exit(130);
  });

  try {
    const result = await geomark(flags.url, {
      timeout: flags.timeout,
    });

    clearInterval(spinnerInterval);
    process.stderr.write("\r" + " ".repeat(60) + "\r");

    if (flags.json) {
      const output = JSON.stringify(result, null, 2);
      if (flags.output) {
        await writeFile(flags.output, output, "utf-8");
        console.log(chalk.green(`Saved JSON to ${flags.output}`));
      } else {
        console.log(output);
      }
    } else {
      let output = "";

      if (flags.frontmatter) {
        const fm = generateFrontmatter({
          title: result.title,
          url: result.url,
          author: result.metadata.author,
          published: result.metadata.published,
          description: result.metadata.description,
          tokens: result.tokens,
        });
        output = `${fm}\n\n${result.markdown}`;
      } else {
        output = result.markdown;
      }

      if (flags.output) {
        await writeFile(flags.output, output, "utf-8");
        console.log(chalk.green(`Saved to ${flags.output}`));
        console.log(chalk.dim(`  ${result.wordCount} words, ~${result.tokens} tokens, ${result.readingTime} min read`));
      } else {
        console.log(output);
      }
    }
  } catch (error) {
    clearInterval(spinnerInterval);
    process.stderr.write("\r" + " ".repeat(60) + "\r");

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
      console.error(chalk.red("Could not resolve hostname. Check the URL and try again."));
    } else if (message.includes("abort") || message.includes("timeout")) {
      console.error(chalk.red("Request timed out. The site may be slow or blocking requests."));
    } else if (message.includes("Blocked")) {
      console.error(chalk.red(message));
    } else {
      console.error(chalk.red(`Error: ${message}`));
    }

    process.exit(1);
  }
}

main();
