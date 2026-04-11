#!/usr/bin/env node

import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const DOCS_ONLY_ALLOWED_PATTERNS = [
  /^docs\//,
  /^AGENTS\.md$/,
  /^README\.md$/,
  /^CONTRIBUTING\.md$/,
  /^\.github\/pull_request_template\.md$/,
  /^supabase\/README\.md$/,
];

function run(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

function normalizeGitPath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function uniqueSorted(items) {
  return Array.from(new Set(items.filter(Boolean).map(normalizeGitPath))).sort((left, right) =>
    left.localeCompare(right)
  );
}

function parseNameStatusZ(output) {
  if (!output) return [];

  const tokens = output.split("\0").filter(Boolean);
  const paths = [];

  for (let index = 0; index < tokens.length; ) {
    const statusToken = tokens[index++]?.trim() ?? "";
    if (!statusToken) continue;

    const statusKind = statusToken[0];

    if (statusKind === "R" || statusKind === "C") {
      const fromPath = tokens[index++] ?? "";
      const toPath = tokens[index++] ?? "";
      if (fromPath) paths.push(fromPath);
      if (toPath) paths.push(toPath);
      continue;
    }

    const filePath = tokens[index++] ?? "";
    if (filePath) paths.push(filePath);
  }

  return uniqueSorted(paths);
}

export function isDocsOnlyEligiblePath(filePath) {
  const normalizedPath = normalizeGitPath(filePath);
  return DOCS_ONLY_ALLOWED_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}

export function isDocsOnlyEligibleChangeSet(changedFiles) {
  return changedFiles.length > 0 && changedFiles.every((filePath) => isDocsOnlyEligiblePath(filePath));
}

export function resolveBaseRef(base = process.env.VERIFICATION_BASE_REF || "main") {
  const candidates = [`origin/${base}`, base, "origin/main", "main", "HEAD~1"];
  return candidates.find((ref) => Boolean(run(`git rev-parse --verify ${ref}`))) ?? "HEAD";
}

function collectBranchComparisonPaths(baseRef) {
  return parseNameStatusZ(run(`git diff --name-status -M -z ${baseRef}...HEAD`));
}

function collectStagedPaths() {
  return parseNameStatusZ(run("git diff --cached --name-status -M -z"));
}

function collectUnstagedPaths() {
  return parseNameStatusZ(run("git diff --name-status -M -z"));
}

function collectUntrackedPaths() {
  const output = run("git ls-files --others --exclude-standard -z");
  if (!output) return [];
  return uniqueSorted(output.split("\0").filter(Boolean));
}

export function collectChangedFiles(baseRef = resolveBaseRef()) {
  return uniqueSorted([
    ...collectBranchComparisonPaths(baseRef),
    ...collectStagedPaths(),
    ...collectUnstagedPaths(),
    ...collectUntrackedPaths(),
  ]);
}

export function explainVerificationScope(changedFiles, options = {}) {
  const env = options.env ?? process.env;
  const normalizedFiles = uniqueSorted(changedFiles);

  if (env.VERIFY_FORCE_FULL === "1") {
    return {
      lane: "full",
      reason: "VERIFY_FORCE_FULL=1 forces the full verification lane.",
      changedFiles: normalizedFiles,
      disallowedPaths: [],
    };
  }

  if (normalizedFiles.length === 0) {
    return {
      lane: "full",
      reason: "No changed files were detected; full verification is the safe fallback.",
      changedFiles: normalizedFiles,
      disallowedPaths: [],
    };
  }

  const disallowedPaths = normalizedFiles.filter((filePath) => !isDocsOnlyEligiblePath(filePath));

  if (disallowedPaths.length > 0) {
    return {
      lane: "full",
      reason: `Non-docs path detected: ${disallowedPaths[0]}.`,
      changedFiles: normalizedFiles,
      disallowedPaths,
    };
  }

  return {
    lane: "docs-only",
    reason: `All ${normalizedFiles.length} changed file(s) are inside the allowed docs/governance path set.`,
    changedFiles: normalizedFiles,
    disallowedPaths: [],
  };
}

export function classifyVerificationLane(changedFiles, options = {}) {
  return explainVerificationScope(changedFiles, options).lane;
}

function parseArgs(argv) {
  let base = process.env.VERIFICATION_BASE_REF || "main";
  let printLane = false;
  let printSummary = false;
  let printJson = false;
  let assertDocsOnly = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--base") {
      base = argv[index + 1] ?? base;
      index += 1;
      continue;
    }

    if (token === "--lane") {
      printLane = true;
      continue;
    }

    if (token === "--summary") {
      printSummary = true;
      continue;
    }

    if (token === "--json") {
      printJson = true;
      continue;
    }

    if (token === "--assert-docs-only") {
      assertDocsOnly = true;
      continue;
    }
  }

  return { base, printLane, printSummary, printJson, assertDocsOnly };
}

function printSummary({ baseRef, scope }) {
  console.log(`[verification-scope] Base ref: ${baseRef}`);
  console.log(`[verification-scope] Lane: ${scope.lane}`);
  console.log(`[verification-scope] Reason: ${scope.reason}`);
  console.log(`[verification-scope] Changed files (${scope.changedFiles.length}):`);

  for (const filePath of scope.changedFiles) {
    const label = isDocsOnlyEligiblePath(filePath) ? "allowed" : "full-only";
    console.log(`- ${filePath} [${label}]`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseRef = resolveBaseRef(args.base);
  const changedFiles = collectChangedFiles(baseRef);
  const scope = explainVerificationScope(changedFiles);

  if (args.printJson) {
    console.log(
      JSON.stringify(
        {
          baseRef,
          lane: scope.lane,
          reason: scope.reason,
          changedFiles: scope.changedFiles,
          disallowedPaths: scope.disallowedPaths,
        },
        null,
        2
      )
    );
  } else if (args.printSummary) {
    printSummary({ baseRef, scope });
  } else if (args.printLane) {
    console.log(scope.lane);
  } else {
    console.log(scope.reason);
  }

  if (args.assertDocsOnly && scope.lane !== "docs-only") {
    console.error(`[verification-scope] FAIL: ${scope.reason}`);
    process.exit(1);
  }
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
