#!/usr/bin/env node

import { execSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const BRIEF_PATH_PATTERN =
  /^docs\/task-briefs\/(planned|in-progress|done|deferred|blocked)\/\d{4}-\d{2}-\d{2}-.+\.md$/;
const VERIFY_LINE_PATTERN =
  /Test Files|Tests|Duration|Running [0-9]+ tests|[0-9]+ failed|[0-9]+ passed|PASS|FAIL/i;

function run(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function parseArgs(argv) {
  let base = "main";
  let output = "";
  let print = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--base") {
      base = argv[index + 1] ?? "main";
      index += 1;
      continue;
    }
    if (token === "--output") {
      output = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (token === "--print") {
      print = true;
      continue;
    }
  }

  return { base, output, print };
}

function resolveBaseRef(base) {
  const candidates = [`origin/${base}`, base, "origin/main", "main", "HEAD~1"];
  return candidates.find((ref) => Boolean(run(`git rev-parse --verify ${ref}`))) ?? "HEAD";
}

function listChangedFiles(baseRef) {
  const output = run(`git diff --name-only ${baseRef}...HEAD`);
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function pickLatestInProgressBrief() {
  const dirPath = "docs/task-briefs/in-progress";
  if (!existsSync(dirPath)) return "";

  const entries = readdirSync(dirPath)
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => path.posix.join(dirPath, entry))
    .map((filePath) => ({ filePath, mtime: statSync(filePath).mtimeMs }))
    .sort((left, right) => right.mtime - left.mtime);

  return entries[0]?.filePath ?? "";
}

function pickActiveBrief(changedFiles) {
  const briefFiles = changedFiles.filter((filePath) => BRIEF_PATH_PATTERN.test(filePath));
  const inProgress = briefFiles.find((filePath) => filePath.includes("/in-progress/"));
  if (inProgress) return inProgress;
  if (briefFiles.length > 0) return briefFiles[0];
  return pickLatestInProgressBrief();
}

function readBriefSummary(briefPath) {
  if (!briefPath || !existsSync(briefPath)) {
    return {
      path: "",
      title: "No linked brief detected",
      scorecardSummary: "Target outcomes not auto-detected.",
    };
  }

  const text = readFileSync(briefPath, "utf8");
  const titleLine =
    text
      .split(/\r?\n/)
      .find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() ?? "Task brief";
  const targetRows = text
    .split(/\r?\n/)
    .filter((line) => /\|\s*`?target`?\s*\|/i.test(line)).length;

  return {
    path: briefPath,
    title: titleLine,
    scorecardSummary:
      targetRows > 0
        ? `${targetRows} target scorecard categories are defined in the linked brief.`
        : "Target outcomes not auto-detected; verify scorecard table in brief.",
  };
}

function readLatestVerifyRun() {
  const runsRoot = "artifacts/test-runs";
  if (!existsSync(runsRoot)) return null;

  const latestLinkPath = path.join(runsRoot, "latest");
  let runDir = "";

  if (existsSync(latestLinkPath)) {
    try {
      if (lstatSync(latestLinkPath).isSymbolicLink()) {
        const latestRef = readlinkSync(latestLinkPath);
        runDir = path.join(runsRoot, latestRef);
      }
    } catch {
      runDir = "";
    }
  }

  if (!runDir || !existsSync(runDir)) {
    const candidates = readdirSync(runsRoot)
      .map((entry) => path.join(runsRoot, entry))
      .filter((candidate) => existsSync(candidate) && statSync(candidate).isDirectory())
      .sort();
    runDir = candidates[candidates.length - 1] ?? "";
  }

  if (!runDir || !existsSync(runDir)) return null;

  const exitCodePath = path.join(runDir, "exit-code.txt");
  const verifyLogPath = path.join(runDir, "verify.log");
  const exitCode = existsSync(exitCodePath) ? readFileSync(exitCodePath, "utf8").trim() : "";
  const status = exitCode === "0" ? "PASS" : exitCode ? "FAIL" : "NOT RUN";
  const summaryLines = existsSync(verifyLogPath)
    ? readFileSync(verifyLogPath, "utf8")
        .split(/\r?\n/)
        .filter((line) => VERIFY_LINE_PATTERN.test(line))
        .slice(-6)
    : [];

  return {
    runDir,
    status,
    summaryLines,
  };
}

function shortList(items, limit = 8) {
  if (items.length <= limit) return items;
  return [...items.slice(0, limit), `... and ${items.length - limit} more file(s)`];
}

function buildBody({ baseRef, branch, headSha, commitTitle, changedFiles, brief, verifyRun }) {
  const generatedAt = new Date().toISOString();
  const changedFileLines = shortList(changedFiles).map((filePath) => `  - \`${filePath}\``);
  const verifySummaryLines =
    verifyRun?.summaryLines.length > 0
      ? verifyRun.summaryLines.map((line) => `  - ${line}`)
      : ["  - No local verify log found in `artifacts/test-runs/latest`."];

  const verifyPrePrLine = verifyRun
    ? `- \`npm run verify:pre-pr\`: **${verifyRun.status}** (${verifyRun.runDir})`
    : "- `npm run verify:pre-pr`: **NOT RUN** (run locally before pushing PR updates).";
  const verifyPreMergeLine =
    "- `npm run verify:pre-merge`: **PENDING** (required before merge to `main`).";

  const briefLinkLine = brief.path
    ? `- Brief link(s): \`${brief.path}\``
    : "- Brief link(s): N/A (add explicit brief path if this PR is intentionally briefless).";

  const summary = [
    "## Summary",
    "",
    `- Auto-generated on ${generatedAt} for branch \`${branch}\` (base ref \`${baseRef}\`).`,
    `- Latest commit: \`${headSha}\` - ${commitTitle || "No commit subject found"}.`,
    `- User-visible changes: describe the concrete user/admin behavior changed in this PR.`,
    `- Technical changes: describe key files/services/contracts changed.`,
    briefLinkLine,
    `- Scorecard target outcomes: ${brief.scorecardSummary}`,
    "",
  ];

  const scope = [
    "## Scope",
    "",
    "- In scope: PR governance automation for structured PR body quality.",
    "- Out of scope: unrelated runtime behavior and content data changes.",
    `- Changed files (${changedFiles.length}):`,
    ...changedFileLines,
    "",
  ];

  const risk = [
    "## Risk",
    "",
    "- Main risk: strict PR-body validation can fail existing low-detail PR drafts.",
    `- Rollback plan: revert \`${headSha}\` if validation blocks expected workflows.`,
    "",
  ];

  const testEvidence = [
    "## Test Evidence",
    "",
    verifyPrePrLine,
    verifyPreMergeLine,
    "- Key verify summary:",
    ...verifySummaryLines,
    "- CI links: use PR Checks tab (`CI / verify`, `CodeQL`, `PR Size`, `Vercel`).",
    "",
    "- [ ] `npm run lint:briefs`",
    "- [ ] `npm run lint`",
    "- [ ] `npm run typecheck`",
    "- [ ] `npm run test:unit`",
    "- [ ] `npm run build`",
    "- [ ] `npm run test:e2e` (or explain why skipped)",
    `- [${verifyRun?.status === "PASS" ? "x" : " "}] \`npm run verify:pre-pr\``,
    "- [ ] `npm run verify:pre-merge` (or explain why private-gate step is not required)",
    "- [ ] Local manual QA done on dev URL (list URL + browser/device in PR description)",
    "- [ ] Vercel preview manual QA done (paste preview URL + browser/device in PR description)",
    "- [ ] QA covered relevant matrix for this change (mobile, tablet, desktop browsers)",
    "",
  ];

  const uiEvidence = [
    "## UI Evidence",
    "",
    "- [ ] Screenshot(s) attached (if UI changed)",
    "- [ ] Mobile behavior checked (if UI changed)",
    "",
  ];

  const checklist = [
    "## Checklist",
    "",
    "- [ ] Acceptance criteria are met",
    "- [ ] Docs updated for behavior/contract changes",
    "- [ ] Changed task briefs include full 10/10 scorecard mapping (all categories marked target/supporting/N/A)",
    "- [ ] Every `target` scorecard row has measurable threshold + evidence source",
    "- [ ] If claiming `10/10`: critical target categories are listed and each is scored `5/5`",
    "- [ ] PR is <= 500 changed lines, or intentionally split/explained",
    "- [ ] No secrets or sensitive data added",
    "",
  ];

  const ownerMerge = [
    "## Owner Merge Step",
    "",
    "- Merge from this PR page when checks and QA are complete.",
    "- Direct URL pattern: `https://github.com/stianvikra/freeswimming/pull/<PR_NUMBER>`",
    "- [ ] Required checks are green",
    "- [ ] Local QA + Vercel preview QA are completed",
    "- [ ] `Squash and merge` clicked by repo owner",
    "",
  ];

  const postMerge = [
    "## Post-Merge Local Sync (owner terminal steps)",
    "",
    "- [ ] `git checkout main`",
    "- [ ] `git pull --ff-only origin main`",
    "- [ ] `git branch -d <merged-branch>`",
    "- [ ] Optional: `git fetch --prune`",
    "",
  ];

  return [
    ...summary,
    ...scope,
    ...risk,
    ...testEvidence,
    ...uiEvidence,
    ...checklist,
    ...ownerMerge,
    ...postMerge,
  ].join("\n");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const baseRef = resolveBaseRef(options.base);
  const branch = run("git branch --show-current") || "unknown-branch";
  const headSha = run("git rev-parse --short HEAD") || "unknown-sha";
  const commitTitle = run("git log -1 --pretty=%s");
  const changedFiles = listChangedFiles(baseRef);
  const activeBriefPath = pickActiveBrief(changedFiles);
  const brief = readBriefSummary(activeBriefPath);
  const verifyRun = readLatestVerifyRun();
  const body = buildBody({
    baseRef,
    branch,
    headSha,
    commitTitle,
    changedFiles,
    brief,
    verifyRun,
  });

  if (options.output) {
    writeFileSync(options.output, body, "utf8");
    if (!options.print) {
      console.log(options.output);
    }
    return;
  }

  process.stdout.write(body);
}

main();
