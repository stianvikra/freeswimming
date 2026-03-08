#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const TRUE_STATUS_VALUES = new Set([
  "paid",
  "complete",
  "completed",
  "succeeded",
  "success",
  "true",
  "1",
  "yes",
]);
const FALSE_STATUS_VALUES = new Set([
  "unpaid",
  "open",
  "pending",
  "failed",
  "canceled",
  "cancelled",
  "false",
  "0",
  "no",
]);

const STRIPE_SESSION_ID_KEYS = ["id", "session_id", "checkout_session_id", "stripe_checkout_session_id"];
const STRIPE_PAYMENT_STATUS_KEYS = ["payment_status", "status", "paid"];
const ENTITLEMENT_SESSION_ID_KEYS = [
  "stripe_checkout_session_id",
  "checkout_session_id",
  "session_id",
  "id",
];
const JSON_ARRAY_KEYS = ["data", "rows", "sessions", "entitlements", "results", "items"];

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeSessionId(value) {
  return normalizeString(value);
}

function rowToLowerKeyMap(row) {
  const output = {};
  for (const [key, value] of Object.entries(row)) {
    output[key.toLowerCase()] = value;
  }
  return output;
}

function getFirstDefinedValue(rowMap, keys) {
  for (const key of keys) {
    const value = rowMap[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return null;
}

function toCsvRows(text) {
  const rows = [];
  let currentCell = "";
  let currentRow = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        currentCell += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows
    .map((row) => row.map((value) => value.trim()))
    .filter((row) => row.some((value) => value.length > 0));
}

export function parseCsv(text) {
  const normalized = text.replace(/^\uFEFF/, "");
  const rows = toCsvRows(normalized);
  if (rows.length === 0) return [];

  const headers = rows[0].map((cell) => cell.trim());
  if (!headers.some((header) => header.length > 0)) return [];

  return rows.slice(1).map((row) => {
    const output = {};
    headers.forEach((header, index) => {
      if (!header) return;
      output[header] = row[index] ?? "";
    });
    return output;
  });
}

function parseJsonToRows(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") {
    throw new Error("JSON input must be an array or object containing an array.");
  }

  for (const key of JSON_ARRAY_KEYS) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate;
  }

  throw new Error(`Could not find row array in JSON object. Supported keys: ${JSON_ARRAY_KEYS.join(", ")}`);
}

export async function loadRowsFromFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".json") {
    const parsed = JSON.parse(trimmed);
    return parseJsonToRows(parsed);
  }

  return parseCsv(trimmed);
}

function isPaidStripeRow(rowMap) {
  const statusRaw = getFirstDefinedValue(rowMap, STRIPE_PAYMENT_STATUS_KEYS);
  if (!statusRaw) return true;

  const status = statusRaw.trim().toLowerCase();
  if (TRUE_STATUS_VALUES.has(status)) return true;
  if (FALSE_STATUS_VALUES.has(status)) return false;
  return true;
}

function collectUniqueIds(rows, keyCandidates, options = {}) {
  const { rowFilter = null } = options;

  const seen = new Set();
  const duplicates = new Set();
  let skippedByFilterCount = 0;
  let skippedMissingIdCount = 0;

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;

    const rowMap = rowToLowerKeyMap(row);

    if (rowFilter && !rowFilter(rowMap)) {
      skippedByFilterCount += 1;
      continue;
    }

    const idValue = getFirstDefinedValue(rowMap, keyCandidates);
    const sessionId = normalizeSessionId(idValue ?? "");
    if (!sessionId) {
      skippedMissingIdCount += 1;
      continue;
    }

    if (seen.has(sessionId)) {
      duplicates.add(sessionId);
      continue;
    }
    seen.add(sessionId);
  }

  return {
    ids: seen,
    duplicates: [...duplicates].sort(),
    skippedByFilterCount,
    skippedMissingIdCount,
  };
}

function setDifference(first, second) {
  const output = [];
  for (const value of first) {
    if (!second.has(value)) {
      output.push(value);
    }
  }
  return output.sort();
}

export function buildFinanceReconciliationReport(
  stripeRows,
  entitlementRows,
  options = {}
) {
  const maxUnexplainedMismatch = Number(options.maxUnexplainedMismatch ?? 0);

  const stripe = collectUniqueIds(stripeRows, STRIPE_SESSION_ID_KEYS, {
    rowFilter: isPaidStripeRow,
  });
  const entitlements = collectUniqueIds(entitlementRows, ENTITLEMENT_SESSION_ID_KEYS);

  const missingEntitlementSessionIds = setDifference(stripe.ids, entitlements.ids);
  const orphanEntitlementSessionIds = setDifference(entitlements.ids, stripe.ids);

  const unexplainedMismatchCount =
    missingEntitlementSessionIds.length +
    orphanEntitlementSessionIds.length +
    stripe.duplicates.length +
    entitlements.duplicates.length;

  return {
    generatedAt: new Date().toISOString(),
    stripePaidSessionCount: stripe.ids.size,
    entitlementSessionCount: entitlements.ids.size,
    missingEntitlementSessionIds,
    orphanEntitlementSessionIds,
    duplicateStripeSessionIds: stripe.duplicates,
    duplicateEntitlementSessionIds: entitlements.duplicates,
    skippedStripeUnpaidCount: stripe.skippedByFilterCount,
    skippedStripeMissingSessionIdCount: stripe.skippedMissingIdCount,
    skippedEntitlementMissingSessionIdCount: entitlements.skippedMissingIdCount,
    maxUnexplainedMismatch,
    unexplainedMismatchCount,
    pass: unexplainedMismatchCount <= maxUnexplainedMismatch,
  };
}

function printReport(report) {
  console.log("[finance-reconcile] Summary");
  console.log(`  Stripe paid sessions: ${report.stripePaidSessionCount}`);
  console.log(`  Entitlement sessions: ${report.entitlementSessionCount}`);
  console.log(`  Missing entitlements: ${report.missingEntitlementSessionIds.length}`);
  console.log(`  Orphan entitlements: ${report.orphanEntitlementSessionIds.length}`);
  console.log(`  Duplicate stripe IDs: ${report.duplicateStripeSessionIds.length}`);
  console.log(`  Duplicate entitlement IDs: ${report.duplicateEntitlementSessionIds.length}`);
  console.log(`  Skipped unpaid stripe rows: ${report.skippedStripeUnpaidCount}`);
  console.log(`  Unexplained mismatches: ${report.unexplainedMismatchCount}`);
  console.log(`  Threshold: <= ${report.maxUnexplainedMismatch}`);
  console.log(`  Result: ${report.pass ? "PASS" : "FAIL"}`);

  if (report.missingEntitlementSessionIds.length > 0) {
    console.log(
      `[finance-reconcile] Missing entitlement session IDs: ${report.missingEntitlementSessionIds.join(", ")}`
    );
  }
  if (report.orphanEntitlementSessionIds.length > 0) {
    console.log(
      `[finance-reconcile] Orphan entitlement session IDs: ${report.orphanEntitlementSessionIds.join(", ")}`
    );
  }
  if (report.duplicateStripeSessionIds.length > 0) {
    console.log(
      `[finance-reconcile] Duplicate stripe session IDs: ${report.duplicateStripeSessionIds.join(", ")}`
    );
  }
  if (report.duplicateEntitlementSessionIds.length > 0) {
    console.log(
      `[finance-reconcile] Duplicate entitlement session IDs: ${report.duplicateEntitlementSessionIds.join(", ")}`
    );
  }
}

async function writeReport(outputPath, report) {
  const fullPath = outputPath.trim();
  if (!fullPath) return;
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`[finance-reconcile] Wrote JSON report: ${fullPath}`);
}

function printHelp() {
  console.log(`Usage:
  npm run finance:reconcile -- --stripe <stripe.csv|stripe.json> --entitlements <entitlements.csv|entitlements.json> [--write <report.json>] [--max-unexplained <n>]

Flags:
  --stripe            Stripe export file path (required)
  --entitlements      Entitlements export file path (required)
  --write             Optional output JSON report path
  --max-unexplained   Allowed mismatch count before failing (default: 0)
  --help              Show this help text`);
}

export function parseCliArgs(argv) {
  const args = {
    stripePath: "",
    entitlementsPath: "",
    outputPath: "",
    maxUnexplainedMismatch: 0,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      args.help = true;
      continue;
    }
    if (token === "--stripe") {
      args.stripePath = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--entitlements") {
      args.entitlementsPath = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--write") {
      args.outputPath = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--max-unexplained") {
      const raw = argv[i + 1] ?? "";
      args.maxUnexplainedMismatch = Number(raw);
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

export async function runCli(argv = process.argv.slice(2)) {
  const args = parseCliArgs(argv);

  if (args.help) {
    printHelp();
    return 0;
  }

  if (!args.stripePath || !args.entitlementsPath) {
    throw new Error("Both --stripe and --entitlements are required.");
  }
  if (!Number.isFinite(args.maxUnexplainedMismatch) || args.maxUnexplainedMismatch < 0) {
    throw new Error("--max-unexplained must be a non-negative number.");
  }

  const [stripeRows, entitlementRows] = await Promise.all([
    loadRowsFromFile(args.stripePath),
    loadRowsFromFile(args.entitlementsPath),
  ]);

  const report = buildFinanceReconciliationReport(stripeRows, entitlementRows, {
    maxUnexplainedMismatch: args.maxUnexplainedMismatch,
  });
  printReport(report);

  if (args.outputPath) {
    await writeReport(args.outputPath, report);
  }

  if (!report.pass) {
    throw new Error(
      `Reconciliation failed with ${report.unexplainedMismatchCount} unexplained mismatches.`
    );
  }

  return 0;
}

const isCliEntrypoint =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliEntrypoint) {
  runCli().catch((error) => {
    console.error("[finance-reconcile] Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
