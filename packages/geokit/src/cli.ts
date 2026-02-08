#!/usr/bin/env node

import chalk from "chalk";
import type { GeokitCliFlags } from "./types.js";

const VERSION = "0.1.0";

function parseArgs(args: string[]): GeokitCliFlags {
  const flags: GeokitCliFlags = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i]!;

    switch (arg) {
      case "audit":
      case "generate":
      case "convert":
      case "fix":
      case "init":
        flags.command = arg;
        break;
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
      case "--verbose":
        flags.verbose = true;
        break;
      case "--quiet":
      case "-q":
        flags.quiet = true;
        break;
      case "--insecure":
        flags.insecure = true;
        break;
      case "--no-meta":
        flags.noMeta = true;
        break;
      case "--frontmatter":
        flags.frontmatter = true;
        break;
      case "--out": {
        i++;
        flags.out = args[i];
        break;
      }
      case "--only": {
        i++;
        flags.only = args[i];
        break;
      }
      case "--config": {
        i++;
        flags.config = args[i];
        break;
      }
      case "--timeout": {
        i++;
        const val = args[i];
        if (val !== undefined && !isNaN(Number(val))) {
          flags.timeout = Number(val);
        }
        break;
      }
      default:
        if (!arg.startsWith("-") && !flags.url) {
          flags.url = arg;
        }
    }
    i++;
  }

  return flags;
}

function printHelp(): void {
  console.log(`
${chalk.bold("geokit")} — Unified toolkit for AI-readiness

${chalk.dim("USAGE")}
  geokit <command> [url] [options]

${chalk.dim("COMMANDS")}
  ${chalk.cyan("audit")} <url>           Audit a website's AI-readiness score
  ${chalk.cyan("generate")} [flags]      Generate GEO-SEO files (llms.txt, robots.txt, sitemap)
  ${chalk.cyan("convert")} <url> [flags] Convert a URL to clean markdown
  ${chalk.cyan("fix")} <url> [--out dir] Audit + auto-fix issues by generating missing files
  ${chalk.cyan("init")}                  Generate a starter geo-seo config file

${chalk.dim("OPTIONS")}
  ${chalk.cyan("--out <dir>")}       Output directory (fix: ./geo-fixes, generate: ./public)
  ${chalk.cyan("--json, -j")}       Output results as JSON
  ${chalk.cyan("--verbose")}        Show detailed output
  ${chalk.cyan("--quiet, -q")}      Minimal output
  ${chalk.cyan("--only <type>")}    Generate only: llms-txt | robots-txt | sitemap | json-ld
  ${chalk.cyan("--config <path>")}  Path to geo-seo config file
  ${chalk.cyan("--timeout <ms>")}   Override default fetch timeout
  ${chalk.cyan("--insecure")}       Skip SSL verification
  ${chalk.cyan("--no-meta")}        Skip metadata extraction (convert)
  ${chalk.cyan("--frontmatter")}    Include YAML frontmatter (convert)
  ${chalk.cyan("--help, -h")}       Show this help message
  ${chalk.cyan("--version, -v")}    Show version

${chalk.dim("EXAMPLES")}
  geokit audit https://example.com
  geokit fix https://example.com --out ./public
  geokit generate --config geo-seo.config.ts
  geokit convert https://example.com --frontmatter
  geokit init

${chalk.dim("Powered by GeoKit — geo.glincker.com")}
`);
}

async function runAudit(flags: GeokitCliFlags): Promise<void> {
  if (!flags.url) {
    console.error(chalk.red("Error: audit requires a URL"));
    process.exit(1);
  }

  const { audit } = await import("@glincker/geo-audit");
  const result = await audit(flags.url, {
    insecure: flags.insecure,
    timeout: flags.timeout,
  });

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const gradeColors: Record<string, (t: string) => string> = {
    A: chalk.green,
    B: chalk.greenBright,
    C: chalk.yellow,
    D: chalk.redBright,
    F: chalk.red,
  };
  const colorFn = gradeColors[result.grade] ?? chalk.white;
  console.log(
    `\n${chalk.bold("Score:")} ${colorFn(chalk.bold(`${result.score}/100`))} (${colorFn(result.grade)})`,
  );

  if (!flags.quiet && result.recommendations.length > 0) {
    console.log(`\n${chalk.bold("Top Issues:")}`);
    for (const rec of result.recommendations.slice(0, 5)) {
      console.log(`  ${chalk.red("*")} ${rec.message} ${chalk.dim(`(+${rec.impact}pt)`)}`);
      if (rec.fix) {
        console.log(`    ${chalk.yellow(`Fix: ${rec.fix}`)}`);
      }
    }
  }

  console.log(chalk.dim(`\nCompleted in ${result.duration}ms`));
}

async function runGenerate(flags: GeokitCliFlags): Promise<void> {
  const { generateAll, defineConfig } = await import("@glincker/geo-seo");
  let config;

  if (flags.config) {
    // Dynamic import of user config
    const userConfig = await import(flags.config);
    config = userConfig.default ?? userConfig;
  } else {
    console.error(chalk.red("Error: generate requires --config <path>"));
    console.error(chalk.dim("Run 'geokit init' to create a starter config."));
    process.exit(1);
  }

  if (flags.out) {
    config = defineConfig({ ...config, output: flags.out });
  }

  const result = await generateAll(config);

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(chalk.green(`\nGenerated ${result.count} files:`));
  for (const file of result.files) {
    console.log(`  ${chalk.cyan(file.name)} ${chalk.dim(`(${file.size} bytes)`)}`);
  }
}

async function runConvert(flags: GeokitCliFlags): Promise<void> {
  if (!flags.url) {
    console.error(chalk.red("Error: convert requires a URL"));
    process.exit(1);
  }

  const { geomark } = await import("@glincker/geomark");
  const result = await geomark(flags.url, {
    includeMetadata: !flags.noMeta,
    timeout: flags.timeout,
  });

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (flags.frontmatter) {
    const { generateFrontmatter } = await import("@glincker/geomark");
    const frontmatterData: Record<string, string | number> = {};
    for (const [key, val] of Object.entries(result.metadata)) {
      if (typeof val === "string" || typeof val === "number") {
        frontmatterData[key] = val;
      }
    }
    console.log(generateFrontmatter(frontmatterData));
  }
  console.log(result.markdown);
}

async function runFix(flags: GeokitCliFlags): Promise<void> {
  if (!flags.url) {
    console.error(chalk.red("Error: fix requires a URL"));
    process.exit(1);
  }

  const { fix } = await import("./fix.js");
  const outDir = flags.out ?? "./geo-fixes";

  console.log(chalk.dim(`Auditing ${flags.url}...`));
  const result = await fix(flags.url, outDir);

  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const gradeColors: Record<string, (t: string) => string> = {
    A: chalk.green,
    B: chalk.greenBright,
    C: chalk.yellow,
    D: chalk.redBright,
    F: chalk.red,
  };
  const colorFn = gradeColors[result.audit.grade] ?? chalk.white;
  console.log(
    `\n${chalk.bold("Current Score:")} ${colorFn(chalk.bold(`${result.audit.score}/100`))} (${colorFn(result.audit.grade)})`,
  );

  if (result.actions.length > 0) {
    console.log(`\n${chalk.bold("Fixes Applied:")}`);
    for (const action of result.actions) {
      const icon = action.applied ? chalk.green("✓") : chalk.red("✗");
      console.log(`  ${icon} ${action.description} ${chalk.dim(`(${action.ruleId})`)}`);
    }
  }

  if (result.generate) {
    console.log(`\n${chalk.bold("Generated Files:")} ${chalk.dim(outDir)}`);
    for (const file of result.generate.files) {
      console.log(`  ${chalk.cyan(file.name)} ${chalk.dim(`(${file.size} bytes)`)}`);
    }
  }

  if (result.estimatedImprovement > 0) {
    console.log(
      `\n${chalk.green(`Estimated improvement: +${result.estimatedImprovement} points`)}`,
    );
  }

  if (result.remainingIssues.length > 0) {
    console.log(`\n${chalk.bold("Remaining Issues:")}`);
    for (const issue of result.remainingIssues.slice(0, 5)) {
      console.log(`  ${chalk.yellow("*")} ${issue.message} ${chalk.dim(`(+${issue.impact}pt)`)}`);
      if (issue.fix) {
        console.log(`    ${chalk.dim(`Hint: ${issue.fix}`)}`);
      }
    }
  }
}

async function runInit(): Promise<void> {
  const { generateConfigTemplate } = await import("@glincker/geo-seo");
  const { writeFile } = await import("node:fs/promises");
  const { resolve } = await import("node:path");

  const template = generateConfigTemplate();
  const outPath = resolve("geo-seo.config.ts");
  await writeFile(outPath, template, "utf-8");
  console.log(chalk.green(`Created ${outPath}`));
  console.log(chalk.dim("Edit the config, then run: geokit generate --config geo-seo.config.ts"));
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

  try {
    switch (flags.command) {
      case "audit":
        await runAudit(flags);
        break;
      case "generate":
        await runGenerate(flags);
        break;
      case "convert":
        await runConvert(flags);
        break;
      case "fix":
        await runFix(flags);
        break;
      case "init":
        await runInit();
        break;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}

main();
