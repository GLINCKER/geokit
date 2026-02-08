#!/usr/bin/env node

import chalk from "chalk";
import { writeFile, readFile, access } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { GeoSeoCliFlags, GeoSeoConfig } from "./types.js";
import { generateConfigTemplate, validateConfig } from "./config.js";
import { generateAll } from "./generate.js";
import { generateLlmsTxt } from "./generators/llms-txt.js";
import { generateRobotsTxt } from "./generators/robots-txt.js";
import { generateSitemap } from "./generators/sitemap.js";

const VERSION = "0.1.0";

function parseArgs(args: string[]): GeoSeoCliFlags {
  const flags: GeoSeoCliFlags = {};
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
      case "--out":
      case "-o":
        i++;
        flags.out = args[i];
        break;
      case "--only":
        i++;
        flags.only = args[i] as GeoSeoCliFlags["only"];
        break;
      case "--config":
      case "-c":
        i++;
        flags.config = args[i];
        break;
      default:
        if (!arg.startsWith("-")) {
          flags.command = arg as GeoSeoCliFlags["command"];
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
${chalk.bold("geo-seo")} — Generate GEO assets for AI discoverability

${chalk.dim("USAGE")}
  geo-seo <command> [options]

${chalk.dim("COMMANDS")}
  ${chalk.cyan("generate")}     Generate all GEO assets (llms.txt, robots.txt, sitemap.xml)
  ${chalk.cyan("init")}         Create a starter geo-seo.config.ts file
  ${chalk.cyan("validate")}     Validate your config file

${chalk.dim("OPTIONS")}
  ${chalk.cyan("--out, -o <dir>")}     Output directory (default: ./public)
  ${chalk.cyan("--only <type>")}       Generate only: llms-txt, robots-txt, sitemap
  ${chalk.cyan("--config, -c <path>")} Path to config file (default: geo-seo.config.ts)
  ${chalk.cyan("--help, -h")}          Show this help message
  ${chalk.cyan("--version, -v")}       Show version

${chalk.dim("EXAMPLES")}
  geo-seo generate
  geo-seo generate --out ./dist
  geo-seo generate --only llms-txt
  geo-seo init
  geo-seo validate

${chalk.dim("Powered by GeoKit — geo.glincker.com")}
`);
}

async function loadConfig(configPath?: string): Promise<GeoSeoConfig> {
  const candidates = configPath
    ? [configPath]
    : [
        "geo-seo.config.ts",
        "geo-seo.config.js",
        "geo-seo.config.mjs",
        "geo-seo.config.json",
      ];

  for (const candidate of candidates) {
    const fullPath = resolve(candidate);
    try {
      await access(fullPath);

      if (candidate.endsWith(".json")) {
        const raw = await readFile(fullPath, "utf-8");
        return JSON.parse(raw) as GeoSeoConfig;
      }

      // Dynamic import for JS/TS configs
      const mod = await import(fullPath);
      return (mod.default ?? mod) as GeoSeoConfig;
    } catch {
      continue;
    }
  }

  throw new Error(
    `No config file found. Run ${chalk.cyan("geo-seo init")} to create one.`,
  );
}

async function handleInit(): Promise<void> {
  const configPath = resolve("geo-seo.config.ts");

  try {
    await access(configPath);
    console.error(chalk.yellow("geo-seo.config.ts already exists. Skipping init."));
    return;
  } catch {
    // File doesn't exist — good, create it
  }

  const template = generateConfigTemplate();
  await writeFile(configPath, template, "utf-8");
  console.log(chalk.green("Created geo-seo.config.ts"));
  console.log(chalk.dim("Edit the config and run: geo-seo generate"));
}

async function handleValidate(flags: GeoSeoCliFlags): Promise<void> {
  try {
    const config = await loadConfig(flags.config);
    const errors = validateConfig(config);

    if (errors.length === 0) {
      console.log(chalk.green("Config is valid!"));
      console.log(chalk.dim(`  ${config.pages.length} pages configured`));
      console.log(chalk.dim(`  AI crawlers: ${config.robots?.aiCrawlers ?? "allow"}`));
    } else {
      console.error(chalk.red("Config validation errors:"));
      for (const err of errors) {
        console.error(chalk.red(`  - ${err}`));
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
    process.exit(1);
  }
}

async function handleGenerate(flags: GeoSeoCliFlags): Promise<void> {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIdx = 0;
  const spinnerInterval = setInterval(() => {
    process.stderr.write(`\r${chalk.cyan(frames[frameIdx % frames.length])} Generating GEO assets...`);
    frameIdx++;
  }, 80);

  try {
    const config = await loadConfig(flags.config);

    // Override output dir if --out flag is set
    if (flags.out) {
      config.output = flags.out;
    }

    if (flags.only) {
      const outDir = resolve(config.output ?? "./public");
      const { mkdir } = await import("node:fs/promises");
      await mkdir(outDir, { recursive: true });

      let content: string;
      let filename: string;

      switch (flags.only) {
        case "llms-txt":
          content = generateLlmsTxt(config);
          filename = "llms.txt";
          break;
        case "robots-txt":
          content = generateRobotsTxt(config);
          filename = "robots.txt";
          break;
        case "sitemap":
          content = generateSitemap(config);
          filename = "sitemap.xml";
          break;
        default:
          throw new Error(`Unknown --only value: ${flags.only}`);
      }

      const filePath = join(outDir, filename);
      await writeFile(filePath, content, "utf-8");

      clearInterval(spinnerInterval);
      process.stderr.write("\r" + " ".repeat(60) + "\r");
      console.log(chalk.green(`Generated ${filename}`));
      console.log(chalk.dim(`  → ${filePath}`));
    } else {
      const result = await generateAll(config);

      clearInterval(spinnerInterval);
      process.stderr.write("\r" + " ".repeat(60) + "\r");

      console.log(chalk.green(`Generated ${result.count} files:`));
      for (const file of result.files) {
        console.log(chalk.dim(`  → ${file.name} (${file.size} bytes)`));
      }
    }
  } catch (error) {
    clearInterval(spinnerInterval);
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
    process.exit(1);
  }
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

  if (flags.help || !flags.command) {
    printHelp();
    return;
  }

  switch (flags.command) {
    case "init":
      await handleInit();
      break;
    case "generate":
      await handleGenerate(flags);
      break;
    case "validate":
      await handleValidate(flags);
      break;
    default:
      console.error(chalk.red(`Unknown command: ${flags.command}`));
      printHelp();
      process.exit(1);
  }
}

main();
