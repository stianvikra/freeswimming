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
import { pathToFileURL } from "node:url";
import { inferPolicyImpactFromChangedFiles } from "./lint-pr-body-sections.mjs";
import { classifyVerificationLane } from "./verification-scope.mjs";

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
  const modePath = path.join(runDir, "mode.txt");
  const verifyLogPath = path.join(runDir, "verify.log");
  const exitCode = existsSync(exitCodePath) ? readFileSync(exitCodePath, "utf8").trim() : "";
  const lane = existsSync(modePath) ? readFileSync(modePath, "utf8").trim() : "";
  const status = exitCode === "0" ? "PASS" : exitCode ? "FAIL" : "NOT RUN";
  const summaryLines = existsSync(verifyLogPath)
    ? readFileSync(verifyLogPath, "utf8")
        .split(/\r?\n/)
        .filter((line) => VERIFY_LINE_PATTERN.test(line))
        .slice(-6)
    : [];

  return {
    runDir,
    lane,
    status,
    summaryLines,
  };
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

export function buildPreMergeEvidenceLine(preMergeMarker, headShaShort) {
  const safeHead = headShaShort || "unknown-sha";
  if (!preMergeMarker) {
    return {
      line: `- \`npm run verify:pre-merge\`: **PENDING** for \`${safeHead}\` (required before merge to \`main\`).`,
      checked: false,
    };
  }

  const markerShort =
    preMergeMarker.shortSha || (preMergeMarker.headSha ? preMergeMarker.headSha.slice(0, 7) : "unknown-sha");
  const markerTime = preMergeMarker.timestampUtc || "unknown time";
  const markerLane = preMergeMarker.verificationLane || "full";
  const markerMode = preMergeMarker.privateGateMode || "unknown";

  if (preMergeMarker.status === "PASS" && preMergeMarker.shaMatches) {
    return {
      line: `- \`npm run verify:pre-merge\`: **PASS** for \`${safeHead}\` (${markerTime}, lane: ${markerLane}, mode: ${markerMode}).`,
      checked: true,
    };
  }

  if (preMergeMarker.status === "PASS") {
    return {
      line: `- \`npm run verify:pre-merge\`: **PENDING** for \`${safeHead}\` (latest PASS was \`${markerShort}\` at ${markerTime}; rerun on current HEAD).`,
      checked: false,
    };
  }

  return {
    line: `- \`npm run verify:pre-merge\`: **${preMergeMarker.status}** for \`${markerShort}\` (${markerTime}); rerun on \`${safeHead}\` before merge.`,
    checked: false,
  };
}

export function buildVerifyPrePrLine(verifyRun) {
  if (!verifyRun) {
    return "- `npm run verify:pre-pr`: **NOT RUN** (run locally before pushing PR updates).";
  }

  const laneSuffix = verifyRun.lane ? `, lane: ${verifyRun.lane}` : "";
  return `- \`npm run verify:pre-pr\`: **${verifyRun.status}** (${verifyRun.runDir}${laneSuffix})`;
}

export function buildVerifyDocsOnlyLine(verifyRun, docsOnlyChecklist) {
  if (!docsOnlyChecklist) {
    return null;
  }

  if (!verifyRun || verifyRun.lane !== "docs-only") {
    return "- `npm run verify:docs-only`: **NOT RUN** (run locally when this PR stays in the docs-only lane).";
  }

  return `- \`npm run verify:docs-only\`: **${verifyRun.status}** (${verifyRun.runDir})`;
}

export function buildCommandChecklist({
  docsOnlyChecklist,
  verifyRun,
  verifyPreMergeEvidence,
}) {
  if (docsOnlyChecklist) {
    return [
      "- [ ] `npm run lint:briefs:all`",
      "- [ ] `npm run lint:admin-audit`",
      "- [ ] `npm run lint:env-parity`",
      "- [ ] `npm run lint:pr-body:generated`",
      `- [${verifyRun?.status === "PASS" && verifyRun?.lane === "docs-only" ? "x" : " "}] \`npm run verify:docs-only\``,
      `- [${verifyRun?.status === "PASS" ? "x" : " "}] \`npm run verify:pre-pr\``,
      `- [${verifyPreMergeEvidence.checked ? "x" : " "}] \`npm run verify:pre-merge\` (must be PASS on current HEAD SHA before merge)`,
      "- [ ] Runtime gates N/A for this pure docs/governance diff, or rationale documented if full lane was forced intentionally",
    ];
  }

  return [
    "- [ ] `npm run lint:briefs`",
    "- [ ] `npm run lint`",
    "- [ ] `npm run typecheck`",
    "- [ ] `npm run test:unit`",
    "- [ ] `npm run build`",
    "- [ ] `npm run test:e2e` (or explain why skipped)",
    `- [${verifyRun?.status === "PASS" ? "x" : " "}] \`npm run verify:pre-pr\``,
    `- [${verifyPreMergeEvidence.checked ? "x" : " "}] \`npm run verify:pre-merge\` (must be PASS on current HEAD SHA before merge)`,
  ];
}

function shortList(items, limit = 8) {
  if (items.length <= limit) return items;
  return [...items.slice(0, limit), `... and ${items.length - limit} more file(s)`];
}

function classifyChangedFile(filePath) {
  if (/^docs\//.test(filePath)) return "docs";
  if (/^scripts\//.test(filePath)) return "scripts";
  if (/^tests\//.test(filePath)) return "tests";
  if (/^\.github\//.test(filePath)) return "ci";
  if (/^app\/api\//.test(filePath)) return "api";
  if (/^(app|components|lib|middleware|public)\//.test(filePath)) return "runtime";
  if (
    /^(package(-lock)?\.json|tsconfig.*\.json|next\.config\.[jt]s|eslint\.config\.[jt]s|postcss\.config\.[jt]s|tailwind\.config\.[jt]s|playwright\.config\.[jt]s|vitest\.config\.[jt]s|\.env\.example|\.gitignore)$/.test(
      filePath
    )
  ) {
    return "config";
  }
  return "other";
}

function summarizeChangedAreas(changedFiles) {
  const counts = {
    runtime: 0,
    api: 0,
    docs: 0,
    scripts: 0,
    tests: 0,
    ci: 0,
    config: 0,
    other: 0,
  };

  for (const filePath of changedFiles) {
    const key = classifyChangedFile(filePath);
    counts[key] += 1;
  }

  return counts;
}

function describeUserVisibleChanges(changedFiles) {
  if (changedFiles.length === 0) {
    return "No runtime behavior changes detected in file diff (metadata/body refresh only).";
  }

  const hasRuntime = changedFiles.some((filePath) => classifyChangedFile(filePath) === "runtime");
  const hasApi = changedFiles.some((filePath) => classifyChangedFile(filePath) === "api");
  const hasAdminSurface = changedFiles.some((filePath) =>
    /^(app\/admin|app\/api\/admin|components\/admin|docs\/runbooks\/|docs\/checklists\/)/.test(filePath)
  );
  const docsOpsOnly = changedFiles.every((filePath) => {
    const group = classifyChangedFile(filePath);
    return group === "docs" || group === "scripts" || group === "ci" || group === "config" || group === "tests";
  });

  if (docsOpsOnly && !hasRuntime && !hasApi) {
    return "No direct end-user/admin runtime behavior change; this PR improves docs/tooling/governance workflow quality.";
  }

  if (hasAdminSurface && (hasRuntime || hasApi)) {
    return "Admin-facing behavior/guardrails may change in touched admin routes or APIs.";
  }

  if (hasApi && !hasRuntime) {
    return "Server/API behavior changed; UI layout/copy changes are out of scope for this PR.";
  }

  if (hasRuntime) {
    return "User/admin runtime behavior may change on touched routes/components.";
  }

  return "No direct user-visible behavior change expected from the touched file areas.";
}

function describeTechnicalChanges(changedFiles) {
  if (changedFiles.length === 0) {
    return "No file changes detected (PR body refresh only).";
  }

  const listedFiles = shortList(changedFiles, 5).map((filePath) => `\`${filePath}\``);
  return `Updated ${changedFiles.length} file(s): ${listedFiles.join(", ")}.`;
}

function describeInScope(changedFiles, areaCounts) {
  if (changedFiles.length === 0) {
    return "PR body refresh/evidence update only.";
  }

  const scopeBits = [];
  if (areaCounts.scripts > 0) scopeBits.push(`automation scripts (${areaCounts.scripts})`);
  if (areaCounts.docs > 0) scopeBits.push(`documentation/runbooks (${areaCounts.docs})`);
  if (areaCounts.tests > 0) scopeBits.push(`tests (${areaCounts.tests})`);
  if (areaCounts.ci > 0) scopeBits.push(`CI/workflow config (${areaCounts.ci})`);
  if (areaCounts.config > 0) scopeBits.push(`project/runtime config files (${areaCounts.config})`);
  if (areaCounts.api > 0) scopeBits.push(`API handlers (${areaCounts.api})`);
  if (areaCounts.runtime > 0) scopeBits.push(`runtime UI/routes/components (${areaCounts.runtime})`);
  if (areaCounts.other > 0) scopeBits.push(`other files (${areaCounts.other})`);

  return `Changed areas: ${scopeBits.join("; ")}.`;
}

function describeOutOfScope(changedFiles, areaCounts) {
  if (changedFiles.length === 0) {
    return "No runtime/data-contract changes.";
  }

  if (areaCounts.runtime === 0 && areaCounts.api === 0) {
    return "Application runtime behavior, DB schema, and content payloads remain unchanged.";
  }

  return "No unrelated modules outside listed file scope; no secret or credential policy changes.";
}

function describeMainRisk(changedFiles, areaCounts) {
  if (changedFiles.length === 0) {
    return "Low risk; body refresh may still overwrite manually edited PR text if used incorrectly.";
  }

  if (areaCounts.scripts > 0 && areaCounts.runtime === 0 && areaCounts.api === 0) {
    return "PR automation/lint strictness could block valid PR updates if generated evidence is stale or incomplete.";
  }

  if (areaCounts.api > 0 || areaCounts.runtime > 0) {
    return "Behavior regressions on touched runtime/API paths if scope assumptions are wrong.";
  }

  return "Operational/docs drift if generated scope/evidence text does not match final merged changes.";
}

function describeRollbackPlan(headShaShort) {
  if (!headShaShort || headShaShort === "unknown-sha") {
    return "Revert this PR to restore previous PR-body automation behavior.";
  }
  return `Revert \`${headShaShort}\` (\`git revert ${headShaShort}\`) to restore previous behavior.`;
}

function describePolicyImpact(changedFiles) {
  const inference = inferPolicyImpactFromChangedFiles(changedFiles);
  if (!inference.required) {
    return {
      summaryLine: "no (no auth/analytics/user-data-rights/third-party processor paths detected).",
      versionNote: "N/A (no policy-impacting scope detected).",
      checklistLine: "N/A (no policy-impacting scope detected in changed files).",
    };
  }

  const triggerPreview = inference.matches
    .slice(0, 3)
    .map((match) => `\`${match.filePath}\``)
    .join(", ");
  const extraCount = Math.max(0, inference.matches.length - 3);
  const triggerSummary = extraCount > 0 ? `${triggerPreview} (+${extraCount} more)` : triggerPreview;

  return {
    summaryLine: `yes (inferred from changed scope: ${triggerSummary}).`,
    versionNote: "N/A (if policy text/version changes, replace with YYYY-MM-DD.rev and rationale).",
    checklistLine: "PENDING (run docs/checklists/policy-impact-release-review.md and update to PASS/FAIL).",
  };
}

function buildBody({
  baseRef,
  branch,
  headShaShort,
  commitTitle,
  changedFiles,
  brief,
  verifyRun,
  preMergeMarker,
}) {
  const generatedAt = new Date().toISOString();
  const areaCounts = summarizeChangedAreas(changedFiles);
  const userVisibleChanges = describeUserVisibleChanges(changedFiles);
  const technicalChanges = describeTechnicalChanges(changedFiles);
  const inScopeDescription = describeInScope(changedFiles, areaCounts);
  const outOfScopeDescription = describeOutOfScope(changedFiles, areaCounts);
  const mainRiskDescription = describeMainRisk(changedFiles, areaCounts);
  const rollbackPlanDescription = describeRollbackPlan(headShaShort);
  const policyImpact = describePolicyImpact(changedFiles);
  const changedFileLines = shortList(changedFiles).map((filePath) => `  - \`${filePath}\``);
  const verifySummaryLines =
    verifyRun?.summaryLines.length > 0
      ? verifyRun.summaryLines.map((line) => `  - ${line}`)
      : ["  - No local verify log found in `artifacts/test-runs/latest`."];
  const inferredVerificationLane = classifyVerificationLane(changedFiles);
  const docsOnlyChecklist =
    verifyRun?.lane === "docs-only" || (!verifyRun?.lane && inferredVerificationLane === "docs-only");
  const verifyDocsOnlyLine = buildVerifyDocsOnlyLine(verifyRun, docsOnlyChecklist);
  const verifyPrePrLine = buildVerifyPrePrLine(verifyRun);
  const verifyPreMergeEvidence = buildPreMergeEvidenceLine(preMergeMarker, headShaShort);
  const verifyPreMergeLine = verifyPreMergeEvidence.line;
  const commandChecklist = buildCommandChecklist({
    docsOnlyChecklist,
    verifyRun,
    verifyPreMergeEvidence,
  });

  const briefLinkLine = brief.path
    ? `- Brief link(s): \`${brief.path}\``
    : "- Brief link(s): N/A (add explicit brief path if this PR is intentionally briefless).";

  const summary = [
    "## Summary",
    "",
    `- Auto-generated on ${generatedAt} for branch \`${branch}\` (base ref \`${baseRef}\`).`,
    `- Latest commit: \`${headShaShort}\` - ${commitTitle || "No commit subject found"}.`,
    `- User-visible changes: ${userVisibleChanges}`,
    `- Technical changes: ${technicalChanges}`,
    `- Policy impact: ${policyImpact.summaryLine}`,
    `- Policy version note: ${policyImpact.versionNote}`,
    briefLinkLine,
    `- Scorecard target outcomes: ${brief.scorecardSummary}`,
    "",
  ];

  const scope = [
    "## Scope",
    "",
    `- In scope: ${inScopeDescription}`,
    `- Out of scope: ${outOfScopeDescription}`,
    `- Changed files (${changedFiles.length}):`,
    ...changedFileLines,
    "",
  ];

  const risk = [
    "## Risk",
    "",
    `- Main risk: ${mainRiskDescription}`,
    `- Rollback plan: ${rollbackPlanDescription}`,
    "",
  ];

  const testEvidence = [
    "## Test Evidence",
    "",
    ...(verifyDocsOnlyLine ? [verifyDocsOnlyLine] : []),
    verifyPrePrLine,
    verifyPreMergeLine,
    `- Policy-impact checklist: ${policyImpact.checklistLine}`,
    "- Policy-impact runbook/checklist: `docs/checklists/policy-impact-release-review.md`",
    "- Key verify summary:",
    ...verifySummaryLines,
    "- CI links: use PR Checks tab (`CI / verify`, `CodeQL`, `PR Size`, `Vercel`).",
    "- Checkbox evidence policy: mark a checkbox only when proof is present in this PR; otherwise leave it unchecked or document `N/A` with rationale.",
    "",
    ...commandChecklist,
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
    "- [ ] Checked boxes in this PR have supporting evidence (scope + gate/CI/QA proof) or explicit `N/A` rationale",
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
  const headShaShort = run("git rev-parse --short HEAD") || "unknown-sha";
  const headShaFull = run("git rev-parse HEAD") || "";
  const commitTitle = run("git log -1 --pretty=%s");
  const changedFiles = listChangedFiles(baseRef);
  const activeBriefPath = pickActiveBrief(changedFiles);
  const brief = readBriefSummary(activeBriefPath);
  const verifyRun = readLatestVerifyRun();
  const preMergeMarker = readLatestPreMergeMarker(headShaFull);
  const body = buildBody({
    baseRef,
    branch,
    headShaShort,
    commitTitle,
    changedFiles,
    brief,
    verifyRun,
    preMergeMarker,
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

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
