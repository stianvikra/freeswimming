#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const DEFAULT_CHECKLIST_PATH = "docs/checklists/admin-full-audit-gate-checklist.md";
const MATRIX_HEADING = "## Critical Workflow Matrix";
const REQUIRED_COLUMNS = ["id", "workflow", "route/api surface", "expected coverage", "evidence"];

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

export function lintAdminAuditChecklistText(markdown, options = {}) {
  const fileExists = options.fileExists ?? ((path) => existsSync(path));
  const readText = options.readText ?? ((path) => readFileSync(path, "utf8"));
  const errors = [];
  const lines = markdown.split(/\r?\n/);
  const { start, end } = findSectionRange(lines, MATRIX_HEADING);

  if (start < 0) {
    return {
      errors: [`Missing required heading: "${MATRIX_HEADING}".`],
      rowCount: 0,
      evidenceCount: 0,
    };
  }

  const table = findFirstTable(lines, start + 1, end);
  if (table.header.length === 0) {
    return {
      errors: [`Missing markdown table under "${MATRIX_HEADING}".`],
      rowCount: 0,
      evidenceCount: 0,
    };
  }

  const normalizedHeader = table.header.map((cell) => normalizeCell(cell));
  const columnIndex = new Map(normalizedHeader.map((value, index) => [value, index]));

  for (const requiredColumn of REQUIRED_COLUMNS) {
    if (!columnIndex.has(requiredColumn)) {
      errors.push(`Missing required column "${requiredColumn}" in critical workflow matrix.`);
    }
  }

  if (errors.length > 0) {
    return {
      errors,
      rowCount: table.rows.length,
      evidenceCount: 0,
    };
  }

  let evidenceCount = 0;
  for (const row of table.rows) {
    const id = (row[columnIndex.get("id")] ?? "").replace(/[`]/g, "").trim();
    const workflow = (row[columnIndex.get("workflow")] ?? "").trim();
    const routeSurface = (row[columnIndex.get("route/api surface")] ?? "").trim();
    const expectedCoverage = (row[columnIndex.get("expected coverage")] ?? "").trim();
    const evidence = (row[columnIndex.get("evidence")] ?? "").trim();

    if (!/^A\d+$/.test(id)) {
      errors.push(`Row has invalid workflow id "${id || "<empty>"}". Expected format A1/A2/...`);
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
  };
}

export function lintAdminAuditChecklistFile(filePath = DEFAULT_CHECKLIST_PATH) {
  const markdown = readFileSync(filePath, "utf8");
  return lintAdminAuditChecklistText(markdown);
}

function runCli() {
  const checklistPath = process.argv[2] ?? DEFAULT_CHECKLIST_PATH;
  const result = lintAdminAuditChecklistFile(checklistPath);
  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`[admin-audit-lint] ERROR ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `[admin-audit-lint] PASS ${checklistPath} (${result.rowCount} workflow row(s), ${result.evidenceCount} evidence reference(s)).`
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
