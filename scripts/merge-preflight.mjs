#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const IN_PROGRESS_BRIEF_PATTERN = /^docs\/task-briefs\/in-progress\/.+\.md$/;

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

function resolveBaseRef(base = process.env.VERIFICATION_BASE_REF || "main") {
  const candidates = [`origin/${base}`, base, "origin/main", "main", "HEAD~1"];
  return candidates.find((ref) => Boolean(run(`git rev-parse --verify ${ref}`))) ?? "HEAD";
}

function listChangedFiles(baseRef) {
  const output = run(`git diff --name-only ${baseRef}...HEAD`);
  if (!output) return [];
  return uniqueSorted(output.split("\n"));
}

function listTrackedChanges() {
  const unstaged = run("git diff --name-only");
  const staged = run("git diff --cached --name-only");
  return uniqueSorted([...(unstaged ? unstaged.split("\n") : []), ...(staged ? staged.split("\n") : [])]);
}

function readLatestPreMergeMarker(headShaFull) {
  const markerPath = "artifacts/verify-pre-merge/latest.json";
  if (!existsSync(markerPath)) return null;

  try {
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    const markerStatus = typeof marker?.status === "string" ? marker.status.toUpperCase() : "UNKNOWN";
    const markerSha = typeof marker?.headSha === "string" ? marker.headSha.trim().toLowerCase() : "";
    const currentSha = typeof headShaFull === "string" ? headShaFull.trim().toLowerCase() : "";
    const shaMatches =
      Boolean(markerSha && currentSha) &&
      (markerSha === currentSha || markerSha.startsWith(currentSha) || currentSha.startsWith(markerSha));

    return {
      status: markerStatus,
      headSha: marker?.headSha ?? "",
      shortSha: marker?.shortSha ?? "",
      timestampUtc: marker?.timestampUtc ?? "",
      verificationLane: marker?.verificationLane ?? "full",
      privateGateMode: marker?.privateGateMode ?? "unknown",
      shaMatches,
    };
  } catch {
    return null;
  }
}

function extractChangedInProgressBriefs(changedFiles) {
  return changedFiles.filter((filePath) => IN_PROGRESS_BRIEF_PATTERN.test(filePath));
}

export function buildMergePreflightReport(options = {}) {
  const baseBranch = String(options.baseBranch ?? "main").trim() || "main";
  const branch = String(options.branch ?? "").trim();
  const headSha = String(options.headSha ?? "").trim();
  const shortSha = headSha ? headSha.slice(0, 7) : "";
  const changedFiles = uniqueSorted(options.changedFiles ?? []);
  const trackedChanges = uniqueSorted(options.trackedChanges ?? []);
  const preMergeMarker = options.preMergeMarker ?? null;
  const changedInProgressBriefs = extractChangedInProgressBriefs(changedFiles);
  const errors = [];
  const warnings = [];

  if (!branch) {
    errors.push("Current git branch could not be determined.");
  } else if (branch === baseBranch) {
    errors.push(`Current branch is \`${branch}\`; merge-preflight must run from a feature branch before merge.`);
  }

  if (!headSha) {
    errors.push("Current HEAD SHA could not be determined.");
  }

  if (!preMergeMarker) {
    errors.push("No local `verify:pre-merge` PASS marker was found. Run `npm run verify:pre-merge` first.");
  } else if (preMergeMarker.status !== "PASS") {
    errors.push(
      `Latest pre-merge marker is \`${preMergeMarker.status}\`, not \`PASS\`. Rerun \`npm run verify:pre-merge\` on current HEAD.`
    );
  } else if (!preMergeMarker.shaMatches) {
    const markerShort = preMergeMarker.shortSha || preMergeMarker.headSha || "unknown";
    errors.push(
      `Latest pre-merge marker belongs to \`${markerShort}\`, not current HEAD \`${shortSha || "unknown"}\`. Rerun \`npm run verify:pre-merge\`.`
    );
  }

  if (trackedChanges.length > 0) {
    errors.push(
      `Tracked file drift is still present after the gate: ${trackedChanges
        .slice(0, 5)
        .map((filePath) => `\`${filePath}\``)
        .join(", ")}${trackedChanges.length > 5 ? ` (+${trackedChanges.length - 5} more)` : ""}.`
    );
  }

  if (changedInProgressBriefs.length === 0) {
    warnings.push(
      "No `docs/task-briefs/in-progress/...` file is part of this branch diff. Confirm the PR body links the intended brief explicitly."
    );
  }

  return {
    ready: errors.length === 0,
    branch,
    baseBranch,
    headSha,
    shortSha,
    changedFiles,
    changedInProgressBriefs,
    trackedChanges,
    preMergeMarker,
    errors,
    warnings,
    nextSteps: [
      "After the PR is merged and local `main` is synced, run `npm run post-merge:preflight` to catch pending brief closeout/sync follow-up.",
    ],
  };
}

function parseArgs(argv) {
  let base = process.env.VERIFICATION_BASE_REF || "main";
  let printSummary = false;
  let printJson = false;
  let assertReady = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--base") {
      base = argv[index + 1] ?? base;
      index += 1;
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

    if (token === "--assert-ready") {
      assertReady = true;
      continue;
    }
  }

  return { base, printSummary, printJson, assertReady };
}

function printSummary(report, baseRef) {
  console.log(`[merge-preflight] Branch: ${report.branch || "unknown"}`);
  console.log(`[merge-preflight] Base ref: ${baseRef}`);
  console.log(`[merge-preflight] HEAD: ${report.shortSha || "unknown"}`);
  if (report.preMergeMarker) {
    console.log(
      `[merge-preflight] Pre-merge marker: ${report.preMergeMarker.status} (${report.preMergeMarker.shortSha || "unknown"} at ${report.preMergeMarker.timestampUtc || "unknown time"}, lane: ${report.preMergeMarker.verificationLane}, mode: ${report.preMergeMarker.privateGateMode})`
    );
  } else {
    console.log("[merge-preflight] Pre-merge marker: missing");
  }

  if (report.changedInProgressBriefs.length > 0) {
    console.log("[merge-preflight] Changed in-progress briefs:");
    for (const filePath of report.changedInProgressBriefs) {
      console.log(`- ${filePath}`);
    }
  }

  if (report.warnings.length > 0) {
    console.log("[merge-preflight] Warnings:");
    for (const warning of report.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (report.errors.length > 0) {
    console.log("[merge-preflight] FAIL");
    for (const error of report.errors) {
      console.log(`- ${error}`);
    }
    return;
  }

  console.log("[merge-preflight] PASS");
  for (const step of report.nextSteps) {
    console.log(`- ${step}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseRef = resolveBaseRef(args.base);
  const headSha = run("git rev-parse HEAD");
  const report = buildMergePreflightReport({
    baseBranch: args.base,
    branch: run("git branch --show-current"),
    headSha,
    changedFiles: listChangedFiles(baseRef),
    trackedChanges: listTrackedChanges(),
    preMergeMarker: readLatestPreMergeMarker(headSha),
  });

  if (args.printJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printSummary(report, baseRef);
  }

  if (args.assertReady && !report.ready) {
    process.exit(1);
  }
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
