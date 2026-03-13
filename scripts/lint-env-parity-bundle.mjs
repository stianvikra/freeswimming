#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

export const BRIEF_FILENAME = "2026-02-19-environment-config-and-secret-parity-audit.md";
export const DEFAULT_RUNBOOK_PATH = "docs/runbooks/environment-config-and-secret-parity.md";
export const DEFAULT_CHECKLIST_PATH = "docs/checklists/admin-access-and-secret-rotation.md";
export const DEFAULT_BRIEF_PATHS = [
  `docs/task-briefs/in-progress/${BRIEF_FILENAME}`,
  `docs/task-briefs/done/${BRIEF_FILENAME}`,
  `docs/task-briefs/planned/${BRIEF_FILENAME}`,
  `docs/task-briefs/deferred/${BRIEF_FILENAME}`,
  `docs/task-briefs/blocked/${BRIEF_FILENAME}`,
];

const RUNBOOK_REQUIRED_HEADINGS = [
  "## Runtime Env Matrix",
  "## Admin Access Troubleshooting (Deterministic)",
  "## Vercel Update Order (Preview/Production)",
  "## Brief Closeout Gate",
];

const CHECKLIST_HEADING = "## Manual Smoke Evidence (Required Before Brief Closeout)";
const REQUIRED_CHECKLIST_COLUMNS = [
  "date (utc)",
  "environment",
  "operator",
  "/auth/sign-in",
  "/api/runtime/flags (ok: true)",
  "dashboardvisible=true (signed-in admin)",
  "/admin",
  "/api/contact (allowed origin)",
  "/api/checkout/session (app flow)",
  "result",
  "notes",
];
const REQUIRED_ENVIRONMENTS = ["preview", "production"];
const REQUIRED_PASS_COLUMNS = [
  "/auth/sign-in",
  "/api/runtime/flags (ok: true)",
  "dashboardvisible=true (signed-in admin)",
  "/admin",
  "/api/contact (allowed origin)",
  "/api/checkout/session (app flow)",
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

function isPlaceholderCell(value) {
  const normalized = normalizeCell(value);
  return normalized === "" || normalized === "tbd" || normalized === "pending";
}

function isPassCell(value) {
  return normalizeCell(value) === "pass";
}

function normalizeEnvironment(value) {
  return normalizeCell(value).replace(/`/g, "");
}

function extractBriefStatus(briefText) {
  const match = briefText.match(/^- `status`: `([^`]+)`/m);
  return match ? match[1].trim().toLowerCase() : "";
}

export function shouldRequireCloseout(briefText, briefPath = "", explicitRequireCloseout = false) {
  if (explicitRequireCloseout) return true;
  if (briefPath.includes("/done/")) return true;
  return extractBriefStatus(briefText) === "done";
}

export function lintEnvParityRunbookText(runbookText) {
  const errors = [];

  for (const heading of RUNBOOK_REQUIRED_HEADINGS) {
    if (!runbookText.includes(heading)) {
      errors.push(`Runbook is missing required heading "${heading}".`);
    }
  }

  if (!runbookText.includes(DEFAULT_CHECKLIST_PATH)) {
    errors.push(`Runbook must reference "${DEFAULT_CHECKLIST_PATH}".`);
  }

  if (!runbookText.includes("Manual smoke evidence table has `pass` for both `preview` and `production`.")) {
    errors.push("Runbook closeout gate must require pass evidence for both preview and production.");
  }

  return { errors };
}

export function lintEnvParityChecklistText(checklistText, options = {}) {
  const errors = [];
  const lines = checklistText.split(/\r?\n/);
  const { start, end } = findSectionRange(lines, CHECKLIST_HEADING);

  if (start < 0) {
    return { errors: [`Checklist is missing required heading "${CHECKLIST_HEADING}".`], rowCount: 0 };
  }

  const table = findFirstTable(lines, start + 1, end);
  if (table.header.length === 0) {
    return { errors: ["Checklist is missing smoke evidence markdown table."], rowCount: 0 };
  }

  const normalizedHeader = table.header.map((cell) => normalizeCell(cell));
  const columnIndex = new Map(normalizedHeader.map((value, index) => [value, index]));

  for (const column of REQUIRED_CHECKLIST_COLUMNS) {
    if (!columnIndex.has(column)) {
      errors.push(`Checklist evidence table is missing required column "${column}".`);
    }
  }

  if (errors.length > 0) {
    return { errors, rowCount: table.rows.length };
  }

  const rows = table.rows.map((row) => {
    const entry = {};
    for (const [key, index] of columnIndex.entries()) {
      entry[key] = row[index] ?? "";
    }
    return entry;
  });

  for (const environment of REQUIRED_ENVIRONMENTS) {
    const envRows = rows.filter((row) => normalizeEnvironment(row.environment ?? "") === environment);
    if (envRows.length === 0) {
      errors.push(`Checklist evidence table is missing "${environment}" row.`);
      continue;
    }

    if (options.requireCloseout) {
      const hasPlaceholderRow = envRows.some(
        (row) =>
          isPlaceholderCell(row["date (utc)"] ?? "") ||
          isPlaceholderCell(row.operator ?? "") ||
          isPlaceholderCell(row.result ?? "")
      );
      if (hasPlaceholderRow) {
        errors.push(
          `Checklist still contains placeholder smoke-evidence row(s) for "${environment}". Replace or remove TBD/pending rows before closeout.`
        );
      }

      const passingRows = envRows.filter((row) => isPassCell(row.result ?? ""));
      if (passingRows.length === 0) {
        errors.push(`Checklist requires at least one passing "${environment}" smoke-evidence row before closeout.`);
        continue;
      }

      const hasCompletePassingRow = passingRows.some((row) => {
        if (isPlaceholderCell(row["date (utc)"] ?? "") || isPlaceholderCell(row.operator ?? "")) {
          return false;
        }
        return REQUIRED_PASS_COLUMNS.every((column) => isPassCell(row[column] ?? ""));
      });

      if (!hasCompletePassingRow) {
        errors.push(
          `Checklist "${environment}" pass row must include non-placeholder operator/date and PASS for every smoke column.`
        );
      }
    }
  }

  if (
    !checklistText.includes("Keep brief `in-progress` until both `preview` and `production` rows are `pass`.") ||
    !checklistText.includes("Template TBD rows must be replaced or removed before brief closeout.")
  ) {
    errors.push("Checklist closeout rule must explicitly require PASS rows and removal of template TBD rows.");
  }

  return { errors, rowCount: rows.length };
}

export function lintEnvParityBundleTexts({
  briefText,
  checklistText,
  runbookText,
  briefPath = "",
  requireCloseout = false,
}) {
  const errors = [];
  const closeoutRequired = shouldRequireCloseout(briefText, briefPath, requireCloseout);

  if (!briefText.includes(DEFAULT_RUNBOOK_PATH)) {
    errors.push(`Brief must reference "${DEFAULT_RUNBOOK_PATH}".`);
  }

  if (!briefText.includes(DEFAULT_CHECKLIST_PATH)) {
    errors.push(`Brief must reference "${DEFAULT_CHECKLIST_PATH}".`);
  }

  errors.push(...lintEnvParityRunbookText(runbookText).errors);
  errors.push(...lintEnvParityChecklistText(checklistText, { requireCloseout: closeoutRequired }).errors);

  return { errors, closeoutRequired };
}

function locateBriefPath() {
  for (const candidate of DEFAULT_BRIEF_PATHS) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not locate ${BRIEF_FILENAME} in docs/task-briefs lifecycle folders.`);
}

export function lintEnvParityBundleFiles(options = {}) {
  const briefPath = options.briefPath ?? locateBriefPath();
  const runbookPath = options.runbookPath ?? DEFAULT_RUNBOOK_PATH;
  const checklistPath = options.checklistPath ?? DEFAULT_CHECKLIST_PATH;

  const result = lintEnvParityBundleTexts({
    briefText: readFileSync(briefPath, "utf8"),
    checklistText: readFileSync(checklistPath, "utf8"),
    runbookText: readFileSync(runbookPath, "utf8"),
    briefPath,
    requireCloseout: options.requireCloseout ?? false,
  });

  return {
    ...result,
    briefPath,
    runbookPath,
    checklistPath,
  };
}

function parseArgs(argv) {
  return {
    requireCloseout: argv.includes("--require-closeout"),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = lintEnvParityBundleFiles(options);

  if (result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(`[env-parity-lint] ERROR ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `[env-parity-lint] PASS ${result.briefPath} + ${result.runbookPath} + ${result.checklistPath}` +
      (result.closeoutRequired ? " (closeout enforced)" : "")
  );
}

const isDirectRun = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isDirectRun) {
  main();
}
