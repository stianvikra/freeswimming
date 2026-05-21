#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { findStaleCanonicalQueueActiveReferences } from "./lint-task-brief-scorecard.mjs";

const IN_PROGRESS_BRIEF_PATTERN = /^docs\/task-briefs\/in-progress\/.+\.md$/;
const DONE_BRIEF_PATTERN = /^docs\/task-briefs\/done\/.+\.md$/;

function run(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function uniqueSorted(items) {
  return Array.from(new Set(items.filter(Boolean).map(normalizePath))).sort((left, right) =>
    left.localeCompare(right)
  );
}

function listChangedFilesForRef(ref = "HEAD") {
  const output = run(`git show --name-only --pretty=format: ${ref}`);
  if (!output) return [];
  return uniqueSorted(output.split("\n"));
}

function extractChangedInProgressBriefs(changedFiles) {
  return changedFiles.filter((filePath) => IN_PROGRESS_BRIEF_PATTERN.test(filePath));
}

function extractChangedDoneBriefs(changedFiles) {
  return changedFiles.filter((filePath) => DONE_BRIEF_PATTERN.test(filePath));
}

function detectStaleCanonicalQueueReferences(changedFiles) {
  const staleReferences = [];

  for (const filePath of extractChangedDoneBriefs(changedFiles)) {
    if (!existsSync(filePath)) continue;
    const content = readFileSync(filePath, "utf8");
    staleReferences.push(...findStaleCanonicalQueueActiveReferences(filePath, content));
  }

  return staleReferences;
}

export function buildPostMergePreflightReport(options = {}) {
  const baseBranch = String(options.baseBranch ?? "main").trim() || "main";
  const branch = String(options.branch ?? "").trim();
  const ref = String(options.ref ?? "HEAD").trim() || "HEAD";
  const changedFiles = uniqueSorted(options.changedFiles ?? []);
  const mergedBranch = String(options.mergedBranch ?? "").trim();
  const changedInProgressBriefs = extractChangedInProgressBriefs(changedFiles);
  const pendingCloseoutBriefs = changedInProgressBriefs.filter((filePath) => existsSync(filePath));
  const staleCanonicalQueueReferences =
    options.staleCanonicalQueueReferences ?? detectStaleCanonicalQueueReferences(changedFiles);
  const warnings = [];
  const actions = [];

  if (branch !== baseBranch) {
    warnings.push(
      `Current branch is \`${branch || "unknown"}\`, not \`${baseBranch}\`. Sync local \`${baseBranch}\` to the merged commit before trusting post-merge closeout output.`
    );
    actions.push(`git checkout ${baseBranch}`);
    actions.push(`git pull --ff-only origin ${baseBranch}`);
    actions.push("npm run post-merge:preflight");
  }

  if (branch === baseBranch && pendingCloseoutBriefs.length > 0) {
    for (const filePath of pendingCloseoutBriefs) {
      actions.push(`npm run task-brief:move -- ${filePath.split("/").pop()} done`);
    }
  }

  if (branch === baseBranch && mergedBranch) {
    actions.push(`git branch -d ${mergedBranch}`);
    actions.push("git fetch --prune origin");
  }

  if (branch === baseBranch && pendingCloseoutBriefs.length === 0) {
    warnings.push("No pending `in-progress` brief closeout was detected in the inspected commit.");
  }

  if (branch === baseBranch && staleCanonicalQueueReferences.length > 0) {
    warnings.push(
      "One or more changed `done` briefs still appear as the active/current/candidate item in a canonical queue or design inventory."
    );
  }

  return {
    branch,
    baseBranch,
    ref,
    changedFiles,
    changedInProgressBriefs,
    pendingCloseoutBriefs,
    staleCanonicalQueueReferences,
    warnings,
    actions,
  };
}

function parseArgs(argv) {
  let base = "main";
  let ref = "HEAD";
  let mergedBranch = "";
  let printJson = false;
  let printSummary = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--base") {
      base = argv[index + 1] ?? base;
      index += 1;
      continue;
    }

    if (token === "--ref") {
      ref = argv[index + 1] ?? ref;
      index += 1;
      continue;
    }

    if (token === "--merged-branch") {
      mergedBranch = argv[index + 1] ?? mergedBranch;
      index += 1;
      continue;
    }

    if (token === "--json") {
      printJson = true;
      continue;
    }

    if (token === "--summary") {
      printSummary = true;
      continue;
    }
  }

  return { base, ref, mergedBranch, printJson, printSummary };
}

function printSummary(report) {
  console.log(`[post-merge-preflight] Branch: ${report.branch || "unknown"}`);
  console.log(`[post-merge-preflight] Inspecting ref: ${report.ref}`);

  if (report.pendingCloseoutBriefs.length > 0) {
    console.log("[post-merge-preflight] Pending brief closeout:");
    for (const filePath of report.pendingCloseoutBriefs) {
      console.log(`- ${filePath}`);
    }
  } else if (report.changedInProgressBriefs.length > 0) {
    console.log("[post-merge-preflight] The inspected commit touched in-progress briefs, but they are already moved or absent on disk.");
  } else {
    console.log("[post-merge-preflight] No in-progress brief file was touched in the inspected commit.");
  }

  if (report.warnings.length > 0) {
    console.log("[post-merge-preflight] Notes:");
    for (const warning of report.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (report.staleCanonicalQueueReferences.length > 0) {
    console.log("[post-merge-preflight] Required queue/inventory updates:");
    for (const staleReference of report.staleCanonicalQueueReferences) {
      console.log(
        `- ${staleReference.referencePath ?? staleReference.canonicalQueuePath}: replace stale active/current/candidate reference "${staleReference.matchedText ?? staleReference.staleActivePath}" for done brief ${staleReference.doneBriefPath}.`
      );
    }
  }

  if (report.actions.length > 0) {
    console.log("[post-merge-preflight] Suggested next commands:");
    for (const action of report.actions) {
      console.log(`- ${action}`);
    }
  } else if (report.staleCanonicalQueueReferences.length === 0) {
    console.log("[post-merge-preflight] No further repo-managed closeout command is required from this commit snapshot.");
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildPostMergePreflightReport({
    baseBranch: args.base,
    branch: run("git branch --show-current"),
    ref: args.ref,
    mergedBranch: args.mergedBranch,
    changedFiles: listChangedFilesForRef(args.ref),
  });

  if (args.printJson) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printSummary(report);
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
