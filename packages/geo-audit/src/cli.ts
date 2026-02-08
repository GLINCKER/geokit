#!/usr/bin/env node

import chalk from "chalk";
import { audit } from "./audit.js";
import type { AuditResult, Category, CliFlags, RuleResult } from "./types.js";

const VERSION = "0.1.0";

function parseArgs(args: string[]): CliFlags {
  const flags: CliFlags = {};
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
      case "--verbose":
        flags.verbose = true;
        break;
      case "--quiet":
      case "-q":
        flags.quiet = true;
        break;
      case "--debug":
        flags.debug = true;
        break;
      case "--insecure":
        flags.insecure = true;
        break;
      case "--no-recommendations":
      case "--no-recs":
        flags.noRecommendations = true;
        break;
      case "--fail-under": {
        i++;
        const val = args[i];
        if (val === undefined || isNaN(Number(val))) {
          console.error(chalk.red("Error: --fail-under requires a numeric value"));
          process.exit(1);
        }
        flags.failUnder = Number(val);
        break;
      }
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
${chalk.bold("geo-audit")} — Audit any website's AI-readiness

${chalk.dim("USAGE")}
  npx geo-audit <url> [options]
  echo "https://example.com" | npx geo-audit [options]

${chalk.dim("OPTIONS")}
  ${chalk.cyan("--json, -j")}        Output results as JSON
  ${chalk.cyan("--verbose")}         Show all rules including passed ones
  ${chalk.cyan("--quiet, -q")}       Only show score and grade
  ${chalk.cyan("--fail-under <n>")}  Exit code 2 if score is below threshold
  ${chalk.cyan("--no-recommendations, --no-recs")}
                        Skip recommendations section
  ${chalk.cyan("--timeout <ms>")}    Override default 10s fetch timeout
  ${chalk.cyan("--insecure")}        Skip SSL verification
  ${chalk.cyan("--debug")}           Show debug information
  ${chalk.cyan("--help, -h")}        Show this help message
  ${chalk.cyan("--version, -v, -V")} Show version

${chalk.dim("EXIT CODES")}
  0  Success
  1  Error (DNS, timeout, network)
  2  Score below --fail-under threshold

${chalk.dim("EXAMPLES")}
  npx geo-audit https://example.com
  npx geo-audit example.com --json
  npx geo-audit example.com --fail-under 80
  npx geo-audit example.com --timeout 20000 --no-recs

${chalk.dim("Powered by GeoKit — geo.glincker.com")}
`);
}

function statusIcon(status: string): string {
  switch (status) {
    case "pass":
      return chalk.green("  ✅");
    case "warn":
      return chalk.yellow("  ⚠️ ");
    case "fail":
      return chalk.red("  ❌");
    case "skip":
      return chalk.dim("  ➖");
    default:
      return "  ";
  }
}

function gradeColor(grade: string): (text: string) => string {
  switch (grade) {
    case "A":
      return chalk.green;
    case "B":
      return chalk.greenBright;
    case "C":
      return chalk.yellow;
    case "D":
      return chalk.redBright;
    case "F":
      return chalk.red;
    default:
      return chalk.white;
  }
}

function printCategory(cat: Category, verbose: boolean): void {
  const pct = cat.maxPoints > 0 ? Math.round((cat.score / cat.maxPoints) * 100) : 0;
  const color = pct >= 80 ? chalk.green : pct >= 50 ? chalk.yellow : chalk.red;

  console.log(
    `\n${chalk.bold(cat.name)}${chalk.dim(`  ${color(`${cat.score}/${cat.maxPoints}`)}`)}`
  );

  for (const rule of cat.rules) {
    if (!verbose && rule.status === "pass") continue;
    printRule(rule);
  }
}

function printRule(rule: RuleResult): void {
  const icon = statusIcon(rule.status);
  const score = chalk.dim(`${rule.score}/${rule.maxScore}`);
  console.log(`${icon} ${rule.name}  ${score}`);
  if (rule.status !== "pass" && rule.status !== "skip") {
    console.log(chalk.dim(`     ${rule.message}`));
  }
}

function printResult(result: AuditResult, flags: CliFlags): void {
  const colorFn = gradeColor(result.grade);
  const hostname = new URL(result.url).hostname;

  console.log(`\n${chalk.bold("🔍 GEO Audit:")} ${hostname}`);
  console.log(chalk.dim("━".repeat(40)));
  console.log(
    `\nScore: ${colorFn(chalk.bold(`${result.score}/100`))} (${colorFn(result.grade)})`
  );

  if (flags.quiet) {
    return;
  }

  // Print categories
  for (const cat of result.categories) {
    printCategory(cat, flags.verbose ?? false);
  }

  // Recommendations (unless --no-recommendations)
  if (!flags.noRecommendations && result.recommendations.length > 0) {
    console.log(`\n${chalk.bold("📋 Top Recommendations:")}`);
    const top = result.recommendations.slice(0, 5);
    for (let i = 0; i < top.length; i++) {
      const rec = top[i]!;
      console.log(
        `  ${chalk.cyan(`${i + 1}.`)} ${rec.message} ${chalk.dim(`(+${rec.impact} points)`)}`
      );
      if (rec.fix) {
        console.log(`     ${chalk.yellow(`💡 Fix: ${rec.fix}`)}`);
      }
    }
  }

  console.log(
    `\n${chalk.dim(`Completed in ${result.duration}ms`)}`
  );
  console.log(chalk.dim("Powered by GeoKit — geo.glincker.com\n"));
}

async function main(): Promise<void> {
  // NO_COLOR support (chalk v5 respects env automatically)
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

  // STDIN support (non-TTY only)
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

  // SIGINT handler
  let spinnerInterval: NodeJS.Timeout | null = null;
  process.on("SIGINT", () => {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
    }
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    process.exit(130);
  });

  // Simple spinner
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIdx = 0;
  spinnerInterval = setInterval(() => {
    process.stderr.write(`\r${chalk.cyan(frames[frameIdx % frames.length])} Auditing ${flags.url}...`);
    frameIdx++;
  }, 80);

  try {
    const result = await audit(flags.url, {
      insecure: flags.insecure,
      timeout: flags.timeout,
    });

    clearInterval(spinnerInterval);
    spinnerInterval = null;
    process.stderr.write("\r" + " ".repeat(60) + "\r");

    if (flags.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      printResult(result, flags);
    }

    // --fail-under exit code 2
    if (flags.failUnder !== undefined && result.score < flags.failUnder) {
      process.exit(2);
    }
  } catch (error) {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
    }
    process.stderr.write("\r" + " ".repeat(60) + "\r");

    if (flags.debug) {
      console.error(error);
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
      console.error(
        chalk.red(`Could not resolve hostname. Check the URL and try again.`)
      );
    } else if (message.includes("abort") || message.includes("timeout")) {
      console.error(
        chalk.red(
          `Request timed out. The site may be slow or blocking requests.`
        )
      );
    } else if (message.includes("SSL") || message.includes("certificate")) {
      console.error(
        chalk.red(
          `SSL certificate error. Try with --insecure (not recommended).`
        )
      );
    } else if (message.includes("Blocked")) {
      console.error(chalk.red(message));
    } else {
      console.error(chalk.red(`Error: ${message}`));
    }

    process.exit(1);
  }
}

main();
