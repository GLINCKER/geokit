#!/usr/bin/env node

/**
 * Version Synchronization Script for GeoKit Monorepo
 * Keeps all 4 packages in lockstep versioning
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "..");

/** All packages that share the same version */
const PACKAGES = [
  "packages/geo-audit/package.json",
  "packages/geo-seo/package.json",
  "packages/geomark/package.json",
  "packages/geokit/package.json",
];

const isCI = !!(process.env.CI || process.env.GITHUB_ACTIONS);

function log(msg) {
  if (!isCI) console.log(msg);
}

/**
 * Read version from the first package (source of truth)
 */
function getCurrentVersion() {
  const pkgPath = path.join(ROOT_DIR, PACKAGES[0]);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return pkg.version;
}

/**
 * Set version in all packages
 */
function setVersion(version) {
  for (const relPath of PACKAGES) {
    const fullPath = path.join(ROOT_DIR, relPath);
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    pkg.version = version;
    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + "\n");
    log(`  Updated ${relPath} → ${version}`);
  }
}

/**
 * Validate semver format
 */
function validateVersion(version) {
  return /^(\d+)\.(\d+)\.(\d+)(-((alpha|beta)\.(\d+)))?$/.test(version);
}

/**
 * Bump version based on release type
 */
function bumpVersion(currentVersion, releaseType, channel = "stable") {
  const base = currentVersion.split("-")[0];
  const parts = base.split(".").map(Number);

  if (parts.some(isNaN) || parts.length !== 3) {
    throw new Error(`Invalid version: ${currentVersion}`);
  }

  const [major, minor, patch] = parts;
  let newVersion;

  switch (releaseType) {
    case "major":
      newVersion = `${major + 1}.0.0`;
      break;
    case "minor":
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case "patch":
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      throw new Error(`Unknown release type: ${releaseType}`);
  }

  // Add prerelease suffix
  if (channel === "beta") {
    newVersion += "-beta.1";
  } else if (channel === "alpha") {
    newVersion += "-alpha.1";
  }

  // Handle prerelease increments (same channel → bump number)
  if (currentVersion.includes("-")) {
    const [, prerelease] = currentVersion.split("-");
    const [prereleaseType, prereleaseNumber] = prerelease.split(".");
    if (channel === prereleaseType) {
      newVersion = `${base}-${prereleaseType}.${parseInt(prereleaseNumber) + 1}`;
    }
  }

  return newVersion;
}

/**
 * Parse conventional commit message to determine release type
 */
function parseCommitMessage(message) {
  // Skip release/maintenance commits
  if (
    message.includes("[skip ci]") ||
    /^chore:\s*bump version/.test(message) ||
    /^chore\(deps/.test(message) ||
    /^Merge pull request.*dependabot/.test(message)
  ) {
    return null;
  }

  // Breaking changes → major
  if (message.includes("BREAKING CHANGE") || /\w+(\(.*?\))?!:/.test(message)) {
    return { releaseType: "major", channel: "stable" };
  }

  // Conventional commit type → bump mapping
  const typeMap = {
    feat: "minor",
    fix: "patch",
    perf: "patch",
    refactor: "patch",
    revert: "patch",
  };

  // Non-release types (don't trigger a release)
  const skipTypes = ["docs", "style", "chore", "test", "build", "ci"];

  for (const type of skipTypes) {
    const pattern = new RegExp(`^${type}(\\(.*?\\))?:\\s+`, "i");
    if (pattern.test(message)) {
      return null;
    }
  }

  for (const [type, releaseType] of Object.entries(typeMap)) {
    const pattern = new RegExp(`^${type}(\\(.*?\\))?:\\s+`, "i");
    if (pattern.test(message)) {
      return { releaseType, channel: "stable" };
    }
  }

  return null;
}

/**
 * Get npm dist tag from version
 */
function getNpmTag(version) {
  if (version.includes("-beta")) return "beta";
  if (version.includes("-alpha")) return "alpha";
  return "latest";
}

// ─── Commands ────────────────────────────────────────────────────────────────

function cmdStatus() {
  const version = getCurrentVersion();
  console.log(`Version: ${version}`);
  console.log(`npm tag: ${getNpmTag(version)}`);
  console.log(`Packages:`);
  for (const relPath of PACKAGES) {
    const fullPath = path.join(ROOT_DIR, relPath);
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const icon = pkg.version === version ? "ok" : "MISMATCH";
    console.log(`  [${icon}] ${pkg.name}@${pkg.version}`);
  }
}

function cmdRelease(releaseType, channel) {
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, releaseType, channel);

  log(`Releasing: ${currentVersion} → ${newVersion} (${releaseType}, ${channel})`);
  setVersion(newVersion);
  log(`Done: all packages bumped to ${newVersion}`);

  // In CI, output just the version for GitHub Actions capture
  if (isCI) {
    console.log(newVersion);
  }

  return newVersion;
}

function cmdDetect() {
  try {
    const lastCommit = execSync("git log -1 --pretty=%B", {
      encoding: "utf8",
    }).trim();

    const releaseInfo = parseCommitMessage(lastCommit);

    if (releaseInfo) {
      console.log(`should_release=true`);
      console.log(`release_type=${releaseInfo.releaseType}`);
      console.log(`channel=${releaseInfo.channel}`);
    } else {
      console.log(`should_release=false`);
    }
  } catch {
    console.log(`should_release=false`);
  }
}

function cmdSync(targetVersion) {
  if (targetVersion) {
    if (!validateVersion(targetVersion)) {
      console.error(`Invalid version: ${targetVersion}`);
      process.exit(1);
    }
    log(`Setting all packages to ${targetVersion}`);
    setVersion(targetVersion);
  } else {
    const version = getCurrentVersion();
    log(`Syncing all packages to ${version}`);
    setVersion(version);
  }
}

function cmdValidate(version) {
  if (validateVersion(version)) {
    console.log(`Valid: ${version}`);
  } else {
    console.error(`Invalid: ${version}`);
    process.exit(1);
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "status":
    cmdStatus();
    break;

  case "release": {
    const releaseType = args[1] || "patch";
    const channel = args[2] || "stable";
    if (!["patch", "minor", "major"].includes(releaseType)) {
      console.error(`Invalid release type: ${releaseType}`);
      process.exit(1);
    }
    if (!["stable", "beta", "alpha"].includes(channel)) {
      console.error(`Invalid channel: ${channel}`);
      process.exit(1);
    }
    cmdRelease(releaseType, channel);
    break;
  }

  case "detect":
    cmdDetect();
    break;

  case "sync":
    cmdSync(args[1]);
    break;

  case "validate":
    if (!args[1]) {
      console.error("Usage: sync-versions.js validate <version>");
      process.exit(1);
    }
    cmdValidate(args[1]);
    break;

  default:
    console.log(`
GeoKit Version Sync

Usage:
  node scripts/sync-versions.js <command> [options]

Commands:
  status                   Show current version of all packages
  release <type> [channel] Bump version (patch|minor|major) [stable|beta|alpha]
  detect                   Detect if last commit triggers release (GH Actions format)
  sync [version]           Sync all packages to same version
  validate <version>       Validate version format
`);
}
