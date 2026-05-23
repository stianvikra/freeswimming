#!/usr/bin/env node

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const BRIEF_ROOT = "docs/task-briefs";
const SCORECARD_PATH = "docs/quality/platform-10-10-scorecard.md";
const BRIEF_PATH_PATTERN =
  /^docs\/task-briefs\/(planned|in-progress|done|deferred|blocked)\/\d{4}-\d{2}-\d{2}-.+\.md$/;
const DONE_BRIEF_PATTERN = /^docs\/task-briefs\/done\/([^/]+\.md)$/;
const EXPLICIT_NA_RATIONALE_CATEGORIES = new Set([
  "incident response and support operations",
  "finance and reporting operations",
  "i18n operational readiness",
]);

function run(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function parseArgs(argv) {
  return {
    all: argv.includes("--all"),
    debug: argv.includes("--debug"),
  };
}

function toCells(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isSeparatorRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return false;
  const cells = toCells(trimmed);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function extractMarkdownTables(text) {
  const lines = text.split(/\r?\n/);
  const tables = [];

  for (let i = 0; i < lines.length - 1; i += 1) {
    if (!lines[i].trim().startsWith("|")) continue;
    if (!isSeparatorRow(lines[i + 1])) continue;

    const header = toCells(lines[i]);
    const rows = [];
    let j = i + 2;

    while (j < lines.length && lines[j].trim().startsWith("|")) {
      if (!isSeparatorRow(lines[j])) {
        rows.push(toCells(lines[j]));
      }
      j += 1;
    }

    tables.push({
      header,
      rows,
      startLine: i + 1,
      endLine: j,
    });
    i = j - 1;
  }

  return tables;
}

function normalizeCategory(input) {
  return input
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMapping(input) {
  const value = input
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (value === "n/a" || value === "na") return "n/a";
  return value;
}

function normalizeCellText(input) {
  return input.replace(/[`*_]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

function nonEmptyValue(input) {
  const value = input.replace(/[`*_]/g, "").trim().toLowerCase();
  return Boolean(value && value !== "n/a" && value !== "na" && value !== "-");
}

function isGenericNA(input) {
  const value = normalizeCellText(input);
  return value === "" || value === "n/a" || value === "na" || value === "-" || value === "none";
}

function parseCanonicalCategories() {
  const scorecardText = readFileSync(SCORECARD_PATH, "utf8");
  const tables = extractMarkdownTables(scorecardText);
  const canonicalTable = tables.find((table) => {
    const headers = table.header.map((value) => value.toLowerCase());
    return headers.some((header) => header.includes("category"));
  });

  if (!canonicalTable) {
    throw new Error(`Could not find category table in ${SCORECARD_PATH}.`);
  }

  const categoryIndex = canonicalTable.header.findIndex((value) =>
    value.toLowerCase().includes("category")
  );

  if (categoryIndex < 0) {
    throw new Error(`Could not detect category column in ${SCORECARD_PATH}.`);
  }

  return canonicalTable.rows
    .map((row) => row[categoryIndex] ?? "")
    .map((value) => value.replace(/[`*_]/g, "").trim())
    .filter(Boolean);
}

function refExists(ref) {
  return Boolean(run(`git rev-parse --verify ${ref}`));
}

function getCurrentBranch() {
  return run("git branch --show-current");
}

function detectBaseRef() {
  const explicit = process.env.BRIEF_LINT_BASE_REF?.trim();
  if (explicit) return explicit;

  const ghBase = process.env.GITHUB_BASE_REF?.trim();
  if (ghBase) {
    const remoteRef = `origin/${ghBase}`;
    if (refExists(remoteRef)) return remoteRef;
  }

  const branch = getCurrentBranch();
  if (branch && branch !== "main" && branch !== "master") {
    if (refExists("origin/main")) return "origin/main";
    if (refExists("origin/master")) return "origin/master";
  }

  if (refExists("HEAD~1")) return "HEAD~1";
  return "";
}

function listAllBriefFiles() {
  const output = run(`find ${BRIEF_ROOT} -type f -name "*.md" | sort`);
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => BRIEF_PATH_PATTERN.test(line));
}

function listChangedBriefFiles(baseRef) {
  if (!baseRef) return [];
  const output = run(`git diff --name-only --diff-filter=ACMR ${baseRef}...HEAD -- ${BRIEF_ROOT}`);
  if (!output) return [];
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => BRIEF_PATH_PATTERN.test(line));
}

function findBriefScorecardTable(text) {
  const tables = extractMarkdownTables(text);
  return tables.find((table) => {
    const headers = table.header.map((value) => value.toLowerCase());
    const hasCategory = headers.some((header) => header.includes("category"));
    const hasMapping = headers.some(
      (header) => header.includes("mapping") || header.includes("class")
    );
    return hasCategory && hasMapping;
  });
}

export function parseScorecardTargetCategories(content) {
  const table = findBriefScorecardTable(content);
  if (!table) return [];

  const header = table.header.map((value) => value.toLowerCase());
  const categoryIndex = header.findIndex((value) => value.includes("category"));
  const mappingIndex = header.findIndex(
    (value) => value.includes("mapping") || value.includes("class")
  );
  if (categoryIndex < 0 || mappingIndex < 0) return [];

  return table.rows
    .filter((row) => normalizeMapping(row[mappingIndex] ?? "") === "target")
    .map((row) => (row[categoryIndex] ?? "").replace(/[`*_]/g, "").trim())
    .filter(Boolean);
}

function findCloseoutScoreTable(text) {
  const tables = extractMarkdownTables(text);
  return tables.find((table) => {
    const headers = table.header.map((value) => normalizeCellText(value));
    const hasCategory = headers.some((header) => header.includes("category"));
    const hasAchievedScore = headers.some(
      (header) =>
        (header.includes("achieved") && header.includes("score")) ||
        header.includes("score outcome")
    );
    const hasEvidence = headers.some((header) => header.includes("evidence"));
    const isPlanningScorecard = headers.some((header) => header.includes("expected closeout"));

    return hasCategory && hasAchievedScore && hasEvidence && !isPlanningScorecard;
  });
}

function parseLifecycleStatus(filePath, content) {
  const pathStatusMatch = filePath.match(/^docs\/task-briefs\/([^/]+)\//);
  const metadataStatusMatch = content.match(/^\s*-\s*`?status`?\s*:\s*`?([^`\n]+?)`?\s*$/im);
  const metadataStatus = metadataStatusMatch?.[1]?.trim().toLowerCase() ?? "";

  if (metadataStatus) return metadataStatus;
  return pathStatusMatch?.[1]?.trim().toLowerCase() ?? "";
}

function parseScoreValue(input) {
  const normalized = input
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, "")
    .trim();
  const match = normalized.match(/^([0-5])(?:\/5)?$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function parseCriticalTargetCategories(content) {
  const lines = content.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    if (!/critical target categories/i.test(lines[index])) continue;

    const categories = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor].trim();

      if (!line) {
        if (categories.length > 0) break;
        continue;
      }

      if (line.startsWith("##") || line.startsWith("|")) break;

      if (line.startsWith("-")) {
        const category = line
          .replace(/^-\s*/, "")
          .replace(/`/g, "")
          .replace(/\s*\(.+\)\s*$/, "")
          .trim();
        if (category) categories.push(category);
      }
    }

    if (categories.length > 0) return categories;
  }

  return [];
}

function parseCloseoutClaim(content) {
  const claimLine =
    content.match(/^\s*-\s*`?10\/10 claim`?\s*:\s*(.+)$/im) ??
    content.match(/^\s*10\/10 claim\s*:\s*(.+)$/im);
  const rawClaim = claimLine?.[1]?.trim() ?? "";
  if (!rawClaim) return null;

  if (/\b(no|not claimed|not claiming|n\/a|none)\b/i.test(rawClaim)) {
    return "no";
  }

  if (/\b(yes|claimed|confirmed|pass|all critical target categories)\b/i.test(rawClaim)) {
    return "yes";
  }

  return null;
}

function parseMetadataPath(content, key) {
  const match = content.match(
    new RegExp(`^\\s*-\\s*\`?${escapeRegExp(key)}\`?\\s*:\\s*\`([^\`]+)\`\\s*$`, "im")
  );
  return normalizePath(match?.[1] ?? "");
}

function parseCanonicalQueuePath(content) {
  return parseMetadataPath(content, "canonical_queue");
}

function parseDesignInventoryPath(content) {
  return parseMetadataPath(content, "design_inventory");
}

function parseRelatedParentBriefPath(content) {
  return parseMetadataPath(content, "related_parent_brief");
}

function parseReferencedReferencePaths(content) {
  const referencePathPattern = /docs\/(?:task-briefs\/planned|design)\/[A-Za-z0-9._/-]+\.md/g;
  return Array.from(content.matchAll(referencePathPattern), (match) => normalizePath(match[0]));
}

function readReferenceText(referencePath, options = {}) {
  const textByPath =
    options.referenceTextByPath ??
    options.canonicalQueueTextByPath ??
    options.designInventoryTextByPath;

  if (textByPath instanceof Map && textByPath.has(referencePath)) {
    return String(textByPath.get(referencePath) ?? "");
  }

  if (
    textByPath &&
    typeof textByPath === "object" &&
    Object.prototype.hasOwnProperty.call(textByPath, referencePath)
  ) {
    return String(textByPath[referencePath] ?? "");
  }

  if (!existsSync(referencePath)) return "";
  return readFileSync(referencePath, "utf8");
}

function normalizeReferenceText(input) {
  return input
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBriefTitleCandidates(fileName, content) {
  const candidates = [];
  const heading = content.match(/^#\s*(?:Task Brief:\s*)?(.+)$/im)?.[1] ?? "";
  const fromHeading = heading.replace(/\s*\(10\/10\)\s*$/i, "").trim();
  if (fromHeading) {
    candidates.push(fromHeading);
    candidates.push(fromHeading.replace(/^AW-\d+\s+/i, "").trim());
  }

  const fromFileName = fileName
    .replace(/\.md$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/^aw-\d+-/i, "")
    .replace(/-10-10$/i, "")
    .replace(/-/g, " ")
    .trim();
  if (fromFileName) candidates.push(fromFileName);

  return Array.from(new Set(candidates.map(normalizeReferenceText))).filter(
    (candidate) => candidate.length >= 12
  );
}

function isAw006Brief(fileName, content) {
  return /\bAW-006\b/i.test(content) || /(?:^|-|\s)aw-006(?:-|\s|$)/i.test(fileName);
}

function isActiveLifecycleText(line) {
  const normalized = normalizeReferenceText(line);
  if (/\b(no|none|not)\s+(active|current|candidate|in progress)\b/i.test(normalized)) {
    return false;
  }
  return /\b(active|current|candidate|in progress)\b/i.test(normalized);
}

function lineMentionsDoneBrief(line, titleCandidates) {
  const normalized = normalizeReferenceText(line);
  return titleCandidates.some((candidate) => normalized.includes(candidate));
}

function isActiveReferenceBlockText(text) {
  return text.split(/\r?\n/).some((line) => {
    if (!isActiveLifecycleText(line)) return false;
    return /^\s*(?:[-*]\s*)?(?:active|current)\b.*\b(?:brief|candidate|slice|implementation)\b.*:/i.test(
      line.trim()
    );
  });
}

function isActiveLifecycleTableRow(line) {
  if (!line.trim().startsWith("|")) return false;
  return toCells(line).some((cell) => {
    const normalized = normalizeReferenceText(cell);
    return (
      normalized === "active" ||
      normalized === "current" ||
      normalized === "candidate" ||
      normalized === "in progress"
    );
  });
}

function withoutCheckpointLogSections(text) {
  const lines = text.split(/\r?\n/);
  const kept = [];
  let inCheckpointLog = false;

  for (const line of lines) {
    if (/^##\s+Checkpoint Log\s*$/i.test(line.trim())) {
      inCheckpointLog = true;
      continue;
    }

    if (inCheckpointLog && /^##\s+\S/.test(line.trim())) {
      inCheckpointLog = false;
    }

    if (!inCheckpointLog) kept.push(line);
  }

  return kept;
}

function findStaleReferenceMatch(referenceText, staleActivePath, titleCandidates) {
  const lines = withoutCheckpointLogSections(referenceText);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const mentionsPath = line.includes(staleActivePath);
    const mentionsTitle = lineMentionsDoneBrief(line, titleCandidates);
    if (!mentionsPath && !mentionsTitle) continue;

    if (line.trim().startsWith("|")) {
      if (isActiveLifecycleTableRow(line)) return line.trim();
      continue;
    }

    if (isActiveLifecycleText(line)) return line.trim();

    const nearbyText = lines
      .slice(Math.max(0, index - 2), Math.min(lines.length, index + 3))
      .join("\n");
    if (!isActiveReferenceBlockText(nearbyText)) continue;

    return line.trim() || nearbyText.trim();
  }

  return "";
}

export function findStaleCanonicalQueueActiveReferences(filePath, content, options = {}) {
  const doneMatch = normalizePath(filePath).match(DONE_BRIEF_PATTERN);
  if (!doneMatch) return [];

  const fileName = doneMatch[1];
  const staleActivePath = `docs/task-briefs/in-progress/${fileName}`;
  const titleCandidates = parseBriefTitleCandidates(fileName, content);
  const includeAw006FallbackReferences = isAw006Brief(fileName, content);
  const referencePaths = Array.from(
    new Set(
      [
        parseCanonicalQueuePath(content),
        parseDesignInventoryPath(content),
        ...(includeAw006FallbackReferences
          ? [parseRelatedParentBriefPath(content), ...parseReferencedReferencePaths(content)]
          : []),
      ].filter(Boolean)
    )
  );
  const staleReferences = [];

  for (const referencePath of referencePaths) {
    const referenceText = readReferenceText(referencePath, options);
    if (!referenceText) continue;

    const matchedText = findStaleReferenceMatch(referenceText, staleActivePath, titleCandidates);
    if (!matchedText) continue;

    staleReferences.push({
      doneBriefPath: normalizePath(filePath),
      canonicalQueuePath: referencePath,
      referencePath,
      staleActivePath,
      matchedText,
    });
  }

  return staleReferences;
}

function validateDoneBriefCloseout(content, targetCategories) {
  const errors = [];
  const closeoutScoreTable = findCloseoutScoreTable(content);

  if (!content.includes("## Completion Record")) {
    errors.push("Done brief is missing `## Completion Record`.");
  }

  if (!closeoutScoreTable) {
    errors.push(
      "Done brief is missing a closeout score table with `Category`, `Achieved Score`, and `Evidence` columns."
    );
    return errors;
  }

  const closeoutHeader = closeoutScoreTable.header.map((value) => normalizeCellText(value));
  const categoryIndex = closeoutHeader.findIndex((value) => value.includes("category"));
  const scoreIndex = closeoutHeader.findIndex(
    (value) =>
      (value.includes("achieved") && value.includes("score")) ||
      value.includes("score outcome")
  );
  const evidenceIndex = closeoutHeader.findIndex((value) => value.includes("evidence"));
  const closeoutRowsByCategory = new Map();

  for (const row of closeoutScoreTable.rows) {
    const category = row[categoryIndex] ?? "";
    if (!category.trim()) continue;
    closeoutRowsByCategory.set(normalizeCategory(category), row);
  }

  const targetCategoryKeys = targetCategories.map((category) => normalizeCategory(category));
  for (const category of targetCategories) {
    const categoryKey = normalizeCategory(category);
    const row = closeoutRowsByCategory.get(categoryKey);

    if (!row) {
      errors.push(`Done brief closeout score table is missing target category "${category}".`);
      continue;
    }

    const score = parseScoreValue(row[scoreIndex] ?? "");
    if (score === null) {
      errors.push(
        `Done brief closeout score for target category "${category}" must be a value from 0-5 or 0/5-5/5.`
      );
      continue;
    }

    if (!nonEmptyValue(row[evidenceIndex] ?? "")) {
      errors.push(`Done brief closeout score for target category "${category}" has empty evidence.`);
    }

    if (
      score < 4 &&
      !/\b(defer|deferred|follow-up|gap|blocked|accepted|owner-approved)\b/i.test(
        row.join(" ")
      )
    ) {
      errors.push(
        `Done brief target category "${category}" scored below 4/5 without explicit deferral or gap rationale.`
      );
    }
  }

  const criticalCategories = parseCriticalTargetCategories(content);
  if (criticalCategories.length === 0) {
    errors.push("Done brief must list critical target categories for the 10/10 claim gate.");
  }

  for (const category of criticalCategories) {
    if (!targetCategoryKeys.includes(normalizeCategory(category))) {
      errors.push(
        `Critical target category "${category}" is not mapped as a scorecard target category.`
      );
    }
  }

  const closeoutClaim = parseCloseoutClaim(content);
  if (!closeoutClaim) {
    errors.push("Done brief must include an explicit `10/10 claim: yes/no` line.");
  }

  if (closeoutClaim === "yes") {
    for (const category of criticalCategories) {
      const row = closeoutRowsByCategory.get(normalizeCategory(category));
      const score = row ? parseScoreValue(row[scoreIndex] ?? "") : null;
      if (score !== 5) {
        errors.push(
          `Done brief claims 10/10 but critical target category "${category}" is not scored 5/5.`
        );
      }
    }
  }

  return errors;
}

export function lintBriefText(filePath, content, canonicalCategories, options = {}) {
  const errors = [];
  const warnings = [];
  const targetCategories = parseScorecardTargetCategories(content);

  if (!content.includes("docs/quality/platform-10-10-scorecard.md")) {
    errors.push("Missing explicit scorecard reference to docs/quality/platform-10-10-scorecard.md.");
  }

  const table = findBriefScorecardTable(content);
  if (!table) {
    errors.push("Missing scorecard mapping table with `Category` + `Mapping/Class` columns.");
    return { filePath, errors, warnings };
  }

  const header = table.header.map((value) => value.toLowerCase());
  const categoryIndex = header.findIndex((value) => value.includes("category"));
  const mappingIndex = header.findIndex(
    (value) => value.includes("mapping") || value.includes("class")
  );
  const thresholdIndex = header.findIndex((value) => value.includes("threshold"));
  const evidenceIndex = header.findIndex((value) => value.includes("evidence"));

  if (thresholdIndex < 0) {
    errors.push("Missing `threshold` column in scorecard mapping table.");
  }

  if (evidenceIndex < 0) {
    errors.push("Missing `evidence` column in scorecard mapping table.");
  }

  const rowMap = new Map();
  for (const row of table.rows) {
    const categoryRaw = row[categoryIndex] ?? "";
    const mappingRaw = row[mappingIndex] ?? "";
    const categoryKey = normalizeCategory(categoryRaw);
    const mapping = normalizeMapping(mappingRaw);
    if (!categoryKey) continue;

    rowMap.set(categoryKey, row);

    if (!["target", "supporting", "n/a"].includes(mapping)) {
      errors.push(
        `Category "${categoryRaw}" has invalid mapping "${mappingRaw}". Use target/supporting/N/A.`
      );
      continue;
    }

    if (mapping === "target") {
      if (thresholdIndex >= 0 && !nonEmptyValue(row[thresholdIndex] ?? "")) {
        errors.push(`Category "${categoryRaw}" is target but has empty threshold.`);
      }
      if (evidenceIndex >= 0 && !nonEmptyValue(row[evidenceIndex] ?? "")) {
        errors.push(`Category "${categoryRaw}" is target but has empty evidence source.`);
      }
    }

    if (
      mapping === "n/a" &&
      EXPLICIT_NA_RATIONALE_CATEGORIES.has(categoryKey) &&
      thresholdIndex >= 0 &&
      evidenceIndex >= 0
    ) {
      const thresholdRaw = row[thresholdIndex] ?? "";
      const evidenceRaw = row[evidenceIndex] ?? "";
      const hasExplicitRationale = !isGenericNA(thresholdRaw) || !isGenericNA(evidenceRaw);
      if (!hasExplicitRationale) {
        errors.push(
          `Category "${categoryRaw}" is N/A and requires explicit rationale in threshold or evidence (not plain N/A).`
        );
      }
    }
  }

  const missingCategories = canonicalCategories.filter(
    (category) => !rowMap.has(normalizeCategory(category))
  );
  if (missingCategories.length > 0) {
    errors.push(
      `Missing canonical categories: ${missingCategories
        .map((category) => `"${category}"`)
        .join(", ")}.`
    );
  }

  if (options.enforceDoneCloseout === true && parseLifecycleStatus(filePath, content) === "done") {
    errors.push(...validateDoneBriefCloseout(content, targetCategories));
  }

  for (const staleReference of findStaleCanonicalQueueActiveReferences(filePath, content, options)) {
    errors.push(
      `Reference doc "${staleReference.referencePath ?? staleReference.canonicalQueuePath}" still lists done brief "${staleReference.doneBriefPath}" as active/current/candidate/in-progress via "${staleReference.matchedText ?? staleReference.staleActivePath}". Update the queue/inventory in the same closeout PR before starting the next slice.`
    );
  }

  return { filePath, errors, warnings };
}

export function lintBrief(filePath, canonicalCategories, options = {}) {
  return lintBriefText(filePath, readFileSync(filePath, "utf8"), canonicalCategories, options);
}

export function main() {
  const args = parseArgs(process.argv.slice(2));
  const canonicalCategories = parseCanonicalCategories();
  const baseRef = detectBaseRef();
  const files = args.all ? listAllBriefFiles() : listChangedBriefFiles(baseRef);

  if (args.debug) {
    console.log(`[brief-lint] baseRef=${baseRef || "(none)"}`);
    console.log(`[brief-lint] files=${files.length}`);
  }

  if (files.length === 0) {
    console.log("[brief-lint] No changed task briefs found. Skipping.");
    process.exit(0);
  }

  const results = files.map((file) =>
    lintBrief(file, canonicalCategories, { enforceDoneCloseout: !args.all })
  );
  const errorResults = results.filter((result) => result.errors.length > 0);

  for (const result of results) {
    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log(`[brief-lint] PASS ${result.filePath}`);
      continue;
    }

    if (result.errors.length > 0) {
      console.error(`[brief-lint] FAIL ${result.filePath}`);
      for (const error of result.errors) {
        console.error(`  - ${error}`);
      }
    }

    for (const warning of result.warnings) {
      console.warn(`[brief-lint] WARN ${result.filePath}: ${warning}`);
    }
  }

  if (errorResults.length > 0) {
    console.error(
      `[brief-lint] ${errorResults.length}/${results.length} brief file(s) failed scorecard checks.`
    );
    process.exit(1);
  }

  console.log(`[brief-lint] All ${results.length} changed brief file(s) passed.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
