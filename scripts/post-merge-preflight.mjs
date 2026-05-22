#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

import {
  findStaleCanonicalQueueActiveReferences,
  parseScorecardTargetCategories,
} from "./lint-task-brief-scorecard.mjs";

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

function toDoneBriefPath(filePath) {
  return `docs/task-briefs/done/${basename(filePath)}`;
}

function readBriefContent(filePath, options = {}) {
  const contentByPath = options.contentByPath ?? options.briefContentByPath;

  if (contentByPath instanceof Map && contentByPath.has(filePath)) {
    return String(contentByPath.get(filePath) ?? "");
  }

  if (
    contentByPath &&
    typeof contentByPath === "object" &&
    Object.prototype.hasOwnProperty.call(contentByPath, filePath)
  ) {
    return String(contentByPath[filePath] ?? "");
  }

  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8");
}

function extractBriefTitle(content, filePath) {
  const fromHeading = content.match(/^#\s*(?:Task Brief:\s*)?(.+)$/im)?.[1]?.trim();
  if (fromHeading) return fromHeading.replace(/\s*\(10\/10\)\s*$/i, "").trim();

  return basename(filePath)
    .replace(/\.md$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/-10-10$/i, "")
    .replace(/-/g, " ")
    .trim();
}

function buildCompletionRecordStarter(filePath, options = {}) {
  const content = readBriefContent(filePath, options);
  const targetCategories = parseScorecardTargetCategories(content);
  const completedDate =
    String(options.completedDate ?? "").trim() || new Date().toISOString().slice(0, 10);
  const title = extractBriefTitle(content, filePath);
  const rows =
    targetCategories.length > 0
      ? targetCategories.map(
          (category) =>
            `| ${category} | \`5/5\` | <local gate / CI / PR evidence> | <none or explicit gap> |`
        )
      : ["| <target category> | `<0-5>/5` | <evidence> | <none or explicit gap> |"];

  return {
    filePath,
    doneBriefPath: toDoneBriefPath(filePath),
    title,
    content: [
      "## Completion Record",
      "",
      `- \`completed\`: \`${completedDate}\``,
      "- `merged_pr`: `<PR number>`",
      "- `squash_commit`: `<merge commit>`",
      `- \`result\`: Closed ${title || "the scoped workstream"}; replace this with a plain-language result.`,
      "- `validation`: `<local gates, CI, and pre-merge evidence>`",
      "- `10/10 claim`: yes/no - `<state whether all critical target categories reached 5/5>`",
      "",
      "| Category | Achieved Score | Evidence | Gaps / Notes |",
      "| --- | --- | --- | --- |",
      ...rows,
    ].join("\n"),
  };
}

function detectStaleCanonicalQueueReferences(changedFiles, options = {}) {
  const staleReferences = [];

  for (const filePath of extractChangedDoneBriefs(changedFiles)) {
    const content = readBriefContent(filePath, options);
    if (!content) continue;
    staleReferences.push(...findStaleCanonicalQueueActiveReferences(filePath, content, options));
  }

  return staleReferences;
}

function detectPendingCloseoutReferenceFallout(pendingCloseoutBriefs, options = {}) {
  const staleReferences = [];

  for (const filePath of pendingCloseoutBriefs) {
    const content = readBriefContent(filePath, options);
    if (!content) continue;

    staleReferences.push(
      ...findStaleCanonicalQueueActiveReferences(toDoneBriefPath(filePath), content, options)
    );
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
    options.staleCanonicalQueueReferences ?? detectStaleCanonicalQueueReferences(changedFiles, options);
  const pendingCloseoutReferenceFallout =
    options.pendingCloseoutReferenceFallout ??
    detectPendingCloseoutReferenceFallout(pendingCloseoutBriefs, options);
  const queueInventoryFallout = [
    ...staleCanonicalQueueReferences,
    ...pendingCloseoutReferenceFallout,
  ];
  const completionRecordStarters =
    options.completionRecordStarters ??
    pendingCloseoutBriefs.map((filePath) => buildCompletionRecordStarter(filePath, options));
  const warnings = [];
  const actions = [];
  const closeoutGateChecklist = [];

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
    closeoutGateChecklist.push("Move each pending in-progress brief to `done`.");
    closeoutGateChecklist.push("Paste and complete the generated `## Completion Record` starter.");
    if (queueInventoryFallout.length > 0) {
      closeoutGateChecklist.push("Update every listed queue/inventory closeout fallout item.");
    }
    closeoutGateChecklist.push("Run `npm run lint:briefs:all` as the first hard closeout gate.");
    closeoutGateChecklist.push("Only then continue to `npm run verify:pre-pr`.");
    actions.push("npm run lint:briefs:all");
    actions.push("npm run verify:pre-pr");
  }

  if (branch === baseBranch && mergedBranch) {
    actions.push(`git branch -d ${mergedBranch}`);
    actions.push("git fetch --prune origin");
  }

  if (branch === baseBranch && pendingCloseoutBriefs.length === 0) {
    warnings.push("No pending `in-progress` brief closeout was detected in the inspected commit.");
  }

  if (branch === baseBranch && queueInventoryFallout.length > 0) {
    warnings.push(
      "One or more closeout briefs still appear as the active/current/candidate item in a canonical queue or design inventory."
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
    pendingCloseoutReferenceFallout,
    queueInventoryFallout,
    completionRecordStarters,
    closeoutGateChecklist,
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

  if (report.queueInventoryFallout.length > 0) {
    console.log("[post-merge-preflight] Required queue/inventory updates:");
    for (const staleReference of report.queueInventoryFallout) {
      console.log(
        `- ${staleReference.referencePath ?? staleReference.canonicalQueuePath}: replace stale active/current/candidate reference "${staleReference.matchedText ?? staleReference.staleActivePath}" for done brief ${staleReference.doneBriefPath}.`
      );
    }
  }

  if (report.completionRecordStarters.length > 0) {
    console.log("[post-merge-preflight] Completion Record starter:");
    for (const starter of report.completionRecordStarters) {
      console.log(`\n${starter.doneBriefPath}`);
      console.log(starter.content);
    }
  }

  if (report.closeoutGateChecklist.length > 0) {
    console.log("[post-merge-preflight] Closeout gate order:");
    for (const item of report.closeoutGateChecklist) {
      console.log(`- ${item}`);
    }
  }

  if (report.actions.length > 0) {
    console.log("[post-merge-preflight] Suggested next commands:");
    for (const action of report.actions) {
      console.log(`- ${action}`);
    }
  } else if (report.queueInventoryFallout.length === 0) {
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
