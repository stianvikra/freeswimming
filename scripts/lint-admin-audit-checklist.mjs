#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DEFAULT_CHECKLIST_PATH = "docs/checklists/admin-full-audit-gate-checklist.md";
const DEFAULT_FINDINGS_PATH = "docs/checklists/admin-full-audit-findings-log.md";
const MATRIX_HEADING = "## Critical Workflow Matrix";
const SCORE_HEADING = "## Workflow Scores (0-5)";
const FINDINGS_HEADING = "## Findings Register";
const CHECKLIST_REQUIRED_COLUMNS = ["id", "workflow", "route/api surface", "expected coverage", "evidence"];
const SCORE_REQUIRED_COLUMNS = ["id", "workflow", "score (0-5)", "evidence", "gap summary", "status"];
const FINDINGS_REQUIRED_COLUMNS = [
  "finding id",
  "severity (p0/p1/p2)",
  "workflow id",
  "gap summary",
  "owner",
  "target date",
  "evidence to close",
  "status",
];

function toCells(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isSeparatorRow(line) {
  const cells = toCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

function normalizeCell(input) {
  return input.toLowerCase().replace(/[`*_]/g, "").replace(/\s+/g, " ").trim();
}

function findSectionRange(lines, heading) {
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) {
    return { start: -1, end: -1 };
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i].trim())) {
      end = i;
      break;
    }
  }

  return { start, end };
}

function findFirstTable(lines, start, end) {
  for (let i = start; i < end - 1; i += 1) {
    if (!lines[i].trim().startsWith("|")) continue;
    if (!isSeparatorRow(lines[i + 1])) continue;

    const header = toCells(lines[i]);
    const rows = [];
    let j = i + 2;

    while (j < end && lines[j].trim().startsWith("|")) {
      if (!isSeparatorRow(lines[j])) {
        rows.push(toCells(lines[j]));
      }
      j += 1;
    }

    return { header, rows };
  }

  return { header: [], rows: [] };
}

function extractEvidenceFilePaths(cell) {
  const inlineCodePaths = [...cell.matchAll(/`([^`]+\.spec\.ts)`/g)].map((match) => match[1].trim());
  if (inlineCodePaths.length > 0) {
    return [...new Set(inlineCodePaths)];
  }

  const rawPaths = [...cell.matchAll(/tests\/e2e\/[A-Za-z0-9._/-]+\.spec\.ts/g)].map((match) => match[0]);
  return [...new Set(rawPaths)];
}

function hasPlaywrightTestDefinition(text) {
  return /\btest(?:\.describe)?\s*\(/.test(text);
}

function workflowSetToSortedArray(workflowIds) {
  return [...workflowIds].sort((left, right) => left.localeCompare(right));
}

function lintTableColumns(header, requiredColumns, sectionLabel) {
  const errors = [];
  const normalizedHeader = header.map((cell) => normalizeCell(cell));
  const columnIndex = new Map(normalizedHeader.map((value, index) => [value, index]));

  for (const requiredColumn of requiredColumns) {
    if (!columnIndex.has(requiredColumn)) {
      errors.push(`Missing required column "${requiredColumn}" in ${sectionLabel}.`);
    }
  }

  return { errors, columnIndex };
}

function findRequiredTable(lines, heading, requiredColumns, sectionLabel) {
  const { start, end } = findSectionRange(lines, heading);
  if (start < 0) {
    return {
      errors: [`Missing required heading: "${heading}".`],
      rows: [],
      columnIndex: new Map(),
    };
  }

  const table = findFirstTable(lines, start + 1, end);
  if (table.header.length === 0) {
    return {
      errors: [`Missing markdown table under "${heading}".`],
      rows: [],
      columnIndex: new Map(),
    };
  }

  const columns = lintTableColumns(table.header, requiredColumns, sectionLabel);
  return {
    errors: columns.errors,
    rows: table.rows,
    columnIndex: columns.columnIndex,
  };
}

export function lintAdminAuditChecklistText(markdown, options = {}) {
  const fileExists = options.fileExists ?? ((path) => existsSync(path));
  const readText = options.readText ?? ((path) => readFileSync(path, "utf8"));
  const errors = [];
  const lines = markdown.split(/\r?\n/);
  const table = findRequiredTable(lines, MATRIX_HEADING, CHECKLIST_REQUIRED_COLUMNS, "critical workflow matrix");
  if (table.errors.length > 0) {
    return {
      errors: table.errors,
      rowCount: 0,
      evidenceCount: 0,
      workflowIds: [],
    };
  }

  const columnIndex = table.columnIndex;
  let evidenceCount = 0;
  const seenWorkflowIds = new Set();
  for (const row of table.rows) {
    const id = (row[columnIndex.get("id")] ?? "").replace(/[`]/g, "").trim();
    const workflow = (row[columnIndex.get("workflow")] ?? "").trim();
    const routeSurface = (row[columnIndex.get("route/api surface")] ?? "").trim();
    const expectedCoverage = (row[columnIndex.get("expected coverage")] ?? "").trim();
    const evidence = (row[columnIndex.get("evidence")] ?? "").trim();

    if (!/^A\d+$/.test(id)) {
      errors.push(`Row has invalid workflow id "${id || "<empty>"}". Expected format A1/A2/...`);
    }
    if (seenWorkflowIds.has(id)) {
      errors.push(`Duplicate workflow id "${id}" in critical workflow matrix.`);
    }
    if (id) {
      seenWorkflowIds.add(id);
    }

    if (!workflow) {
      errors.push(`Workflow "${id || "<unknown>"}" has empty workflow description.`);
    }
    if (!routeSurface) {
      errors.push(`Workflow "${id || "<unknown>"}" has empty route/API surface column.`);
    }
    if (!expectedCoverage) {
      errors.push(`Workflow "${id || "<unknown>"}" has empty expected coverage column.`);
    }
    if (!evidence) {
      errors.push(`Workflow "${id || "<unknown>"}" has empty evidence column.`);
      continue;
    }

    const evidencePaths = extractEvidenceFilePaths(evidence);
    if (evidencePaths.length === 0) {
      errors.push(`Workflow "${id || "<unknown>"}" has no parsable *.spec.ts evidence paths.`);
      continue;
    }

    evidenceCount += evidencePaths.length;
    for (const evidencePath of evidencePaths) {
      if (!evidencePath.startsWith("tests/e2e/")) {
        errors.push(`Workflow "${id}" evidence path must be under tests/e2e: "${evidencePath}".`);
        continue;
      }

      if (!fileExists(evidencePath)) {
        errors.push(`Workflow "${id}" evidence file does not exist: "${evidencePath}".`);
        continue;
      }

      const fileText = readText(evidencePath);
      if (!hasPlaywrightTestDefinition(fileText)) {
        errors.push(`Workflow "${id}" evidence file has no Playwright test definitions: "${evidencePath}".`);
      }
    }
  }

  return {
    errors,
    rowCount: table.rows.length,
    evidenceCount,
    workflowIds: workflowSetToSortedArray(seenWorkflowIds),
  };
}

export function lintAdminAuditChecklistFile(filePath = DEFAULT_CHECKLIST_PATH) {
  const markdown = readFileSync(filePath, "utf8");
  return lintAdminAuditChecklistText(markdown);
}

export function lintAdminAuditFindingsText(markdown, options = {}) {
  const errors = [];
  const lines = markdown.split(/\r?\n/);
  const expectedWorkflowIds = new Set(options.expectedWorkflowIds ?? []);

  const scoreTable = findRequiredTable(lines, SCORE_HEADING, SCORE_REQUIRED_COLUMNS, "workflow scores table");
  if (scoreTable.errors.length > 0) {
    return {
      errors: scoreTable.errors,
      scoreRowCount: 0,
      findingRowCount: 0,
    };
  }

  const scoreColumnIndex = scoreTable.columnIndex;
  const seenWorkflowIds = new Set();
  for (const row of scoreTable.rows) {
    const workflowId = (row[scoreColumnIndex.get("id")] ?? "").replace(/[`]/g, "").trim();
    const workflow = (row[scoreColumnIndex.get("workflow")] ?? "").trim();
    const scoreRaw = (row[scoreColumnIndex.get("score (0-5)")] ?? "").replace(/[`]/g, "").trim();
    const evidence = (row[scoreColumnIndex.get("evidence")] ?? "").trim();
    const gapSummary = (row[scoreColumnIndex.get("gap summary")] ?? "").trim();
    const status = (row[scoreColumnIndex.get("status")] ?? "").trim();

    if (!/^A\d+$/.test(workflowId)) {
      errors.push(`Score row has invalid workflow id "${workflowId || "<empty>"}". Expected format A1/A2/...`);
    } else if (seenWorkflowIds.has(workflowId)) {
      errors.push(`Workflow score table has duplicate workflow id "${workflowId}".`);
    } else {
      seenWorkflowIds.add(workflowId);
    }

    if (!workflow) {
      errors.push(`Workflow score row "${workflowId || "<unknown>"}" has empty workflow description.`);
    }
    if (!scoreRaw) {
      errors.push(`Workflow score row "${workflowId || "<unknown>"}" has empty score.`);
    } else {
      const score = Number(scoreRaw);
      if (!Number.isInteger(score) || score < 0 || score > 5) {
        errors.push(`Workflow score row "${workflowId || "<unknown>"}" has invalid score "${scoreRaw}". Expected integer 0-5.`);
      }
    }
    if (!evidence) {
      errors.push(`Workflow score row "${workflowId || "<unknown>"}" has empty evidence column.`);
    }
    if (!gapSummary) {
      errors.push(`Workflow score row "${workflowId || "<unknown>"}" has empty gap summary column.`);
    }
    if (!status) {
      errors.push(`Workflow score row "${workflowId || "<unknown>"}" has empty status column.`);
    }
  }

  if (expectedWorkflowIds.size > 0) {
    const missingInScores = workflowSetToSortedArray(expectedWorkflowIds).filter((id) => !seenWorkflowIds.has(id));
    if (missingInScores.length > 0) {
      errors.push(
        `Workflow score table is missing ids from checklist matrix: ${missingInScores.join(", ")}.`
      );
    }

    const unknownInScores = workflowSetToSortedArray(seenWorkflowIds).filter((id) => !expectedWorkflowIds.has(id));
    if (unknownInScores.length > 0) {
      errors.push(`Workflow score table has ids not present in checklist matrix: ${unknownInScores.join(", ")}.`);
    }
  }

  const findingsTable = findRequiredTable(lines, FINDINGS_HEADING, FINDINGS_REQUIRED_COLUMNS, "findings register");
  if (findingsTable.errors.length > 0) {
    return {
      errors: [...errors, ...findingsTable.errors],
      scoreRowCount: scoreTable.rows.length,
      findingRowCount: 0,
    };
  }

  const findingColumnIndex = findingsTable.columnIndex;
  const seenFindingIds = new Set();
  for (const row of findingsTable.rows) {
    const findingId = (row[findingColumnIndex.get("finding id")] ?? "").replace(/[`]/g, "").trim();
    const severity = (row[findingColumnIndex.get("severity (p0/p1/p2)")] ?? "").replace(/[`]/g, "").trim();
    const workflowId = (row[findingColumnIndex.get("workflow id")] ?? "").replace(/[`]/g, "").trim();
    const gapSummary = (row[findingColumnIndex.get("gap summary")] ?? "").trim();
    const owner = (row[findingColumnIndex.get("owner")] ?? "").trim();
    const targetDate = (row[findingColumnIndex.get("target date")] ?? "").replace(/[`]/g, "").trim();
    const evidenceToClose = (row[findingColumnIndex.get("evidence to close")] ?? "").trim();
    const status = (row[findingColumnIndex.get("status")] ?? "").trim();

    if (!/^F\d{3}$/.test(findingId)) {
      errors.push(`Findings register row has invalid finding id "${findingId || "<empty>"}". Expected F001/F002/...`);
    } else if (seenFindingIds.has(findingId)) {
      errors.push(`Findings register has duplicate finding id "${findingId}".`);
    } else {
      seenFindingIds.add(findingId);
    }

    if (!/^P[0-2]$/i.test(severity)) {
      errors.push(`Findings register row "${findingId || "<unknown>"}" has invalid severity "${severity || "<empty>"}". Expected P0/P1/P2.`);
    }
    if (!/^A\d+$/.test(workflowId)) {
      errors.push(`Findings register row "${findingId || "<unknown>"}" has invalid workflow id "${workflowId || "<empty>"}". Expected A1/A2/...`);
    } else if (expectedWorkflowIds.size > 0 && !expectedWorkflowIds.has(workflowId)) {
      errors.push(
        `Findings register row "${findingId || "<unknown>"}" references workflow id "${workflowId}" not present in checklist matrix.`
      );
    }
    if (!gapSummary) {
      errors.push(`Findings register row "${findingId || "<unknown>"}" has empty gap summary.`);
    }
    if (!owner) {
      errors.push(`Findings register row "${findingId || "<unknown>"}" has empty owner.`);
    }
    if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      errors.push(
        `Findings register row "${findingId || "<unknown>"}" has invalid target date "${targetDate || "<empty>"}". Expected YYYY-MM-DD.`
      );
    }
    if (!evidenceToClose) {
      errors.push(`Findings register row "${findingId || "<unknown>"}" has empty evidence-to-close column.`);
    }
    if (!status) {
      errors.push(`Findings register row "${findingId || "<unknown>"}" has empty status.`);
    }
  }

  return {
    errors,
    scoreRowCount: scoreTable.rows.length,
    findingRowCount: findingsTable.rows.length,
  };
}

export function lintAdminAuditFindingsFile(filePath = DEFAULT_FINDINGS_PATH, options = {}) {
  const markdown = readFileSync(filePath, "utf8");
  return lintAdminAuditFindingsText(markdown, options);
}

export function lintAdminAuditGateBundleFile(
  checklistPath = DEFAULT_CHECKLIST_PATH,
  findingsPath = DEFAULT_FINDINGS_PATH,
  options = {}
) {
  const readMarkdown = options.readMarkdown ?? ((path) => readFileSync(path, "utf8"));
  const checklistResult = lintAdminAuditChecklistText(readMarkdown(checklistPath), {
    fileExists: options.fileExists,
    readText: options.readText,
  });

  const findingsResult = lintAdminAuditFindingsText(readMarkdown(findingsPath), {
    expectedWorkflowIds: checklistResult.workflowIds,
  });

  return {
    errors: [
      ...checklistResult.errors.map((error) => `[checklist] ${error}`),
      ...findingsResult.errors.map((error) => `[findings] ${error}`),
    ],
    checklistRowCount: checklistResult.rowCount,
    checklistEvidenceCount: checklistResult.evidenceCount,
    findingsScoreRowCount: findingsResult.scoreRowCount,
    findingsRegisterRowCount: findingsResult.findingRowCount,
  };
}

function runCli() {
  const checklistPath = process.argv[2] ?? DEFAULT_CHECKLIST_PATH;
  const findingsPath = process.argv[3] ?? DEFAULT_FINDINGS_PATH;
  const result = lintAdminAuditGateBundleFile(checklistPath, findingsPath);
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`[admin-audit-lint] ERROR ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `[admin-audit-lint] PASS ${checklistPath} + ${findingsPath} ` +
      `(${result.checklistRowCount} checklist workflow row(s), ${result.checklistEvidenceCount} evidence reference(s), ` +
      `${result.findingsScoreRowCount} score row(s), ${result.findingsRegisterRowCount} finding row(s)).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
