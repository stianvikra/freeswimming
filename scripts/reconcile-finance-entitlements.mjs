#!/usr/bin/env node

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
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
const SUPPORTED_INPUT_EXTENSIONS = new Set([".csv", ".json"]);
const STRIPE_FILENAME_HINTS = ["stripe", "checkout", "session"];
const ENTITLEMENT_FILENAME_HINTS = ["entitlement", "entitlements"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SUPABASE_PAGE_SIZE = 1000;

function normalizeString(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeSessionId(value) {
  return normalizeString(value);
}

function requireEnv(name) {
  const value = normalizeString(process.env[name] ?? "");
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseIsoDateStart(dateValue, flagName) {
  if (!ISO_DATE_PATTERN.test(dateValue)) {
    throw new Error(`${flagName} must use YYYY-MM-DD format.`);
  }
  const timestamp = Date.parse(`${dateValue}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${flagName} is invalid: ${dateValue}`);
  }
  return timestamp;
}

export function resolveDateRangeWindow(fromDate, toDate) {
  const fromStartMs = parseIsoDateStart(fromDate, "--from");
  const toStartMs = parseIsoDateStart(toDate, "--to");

  if (toStartMs < fromStartMs) {
    throw new Error("--to must be on or after --from.");
  }

  const toExclusiveMs = toStartMs + DAY_IN_MS;

  return {
    fromDate,
    toDate,
    fromIso: new Date(fromStartMs).toISOString(),
    toIsoExclusive: new Date(toExclusiveMs).toISOString(),
    stripeCreatedGte: Math.floor(fromStartMs / 1000),
    stripeCreatedLte: Math.floor((toExclusiveMs - 1000) / 1000),
  };
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

function filenameHasAnyHint(filename, hints) {
  const lowered = filename.toLowerCase();
  return hints.some((hint) => lowered.includes(hint));
}

async function findLatestInputFile(inputDir, hints, label) {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const candidates = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_INPUT_EXTENSIONS.has(extension)) continue;
    if (!filenameHasAnyHint(entry.name, hints)) continue;

    const fullPath = path.join(inputDir, entry.name);
    const fileStat = await stat(fullPath);
    candidates.push({ fullPath, mtimeMs: fileStat.mtimeMs });
  }

  if (candidates.length === 0) {
    throw new Error(
      `Could not find ${label} export file in --input-dir (${inputDir}). Expected filename hint(s): ${hints.join(", ")}`
    );
  }

  candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return candidates[0].fullPath;
}

export async function resolveInputPaths(args) {
  let stripePath = args.stripePath;
  let entitlementsPath = args.entitlementsPath;

  if (args.inputDir) {
    if (!stripePath) {
      stripePath = await findLatestInputFile(args.inputDir, STRIPE_FILENAME_HINTS, "stripe");
    }
    if (!entitlementsPath) {
      entitlementsPath = await findLatestInputFile(
        args.inputDir,
        ENTITLEMENT_FILENAME_HINTS,
        "entitlements"
      );
    }
  }

  return {
    stripePath,
    entitlementsPath,
  };
}

function resolveCollectOutputDir(args, window) {
  if (args.collectDir) {
    return args.collectDir;
  }
  return path.join("artifacts", "finance-exports", `live-${window.fromDate}-to-${window.toDate}`);
}

async function writeRowsJson(filePath, rows) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify({ data: rows }, null, 2)}\n`, "utf8");
}

async function collectStripeRows(window) {
  const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
  const stripeClient = new Stripe(stripeSecretKey);
  const rows = [];

  const sessionList = stripeClient.checkout.sessions.list({
    limit: 100,
    created: {
      gte: window.stripeCreatedGte,
      lte: window.stripeCreatedLte,
    },
  });

  for await (const session of sessionList.autoPagingIterable()) {
    rows.push({
      id: session.id,
      payment_status: session.payment_status ?? "",
      status: session.status ?? "",
      created: session.created,
      customer: session.customer ?? "",
      customer_email: session.customer_details?.email ?? "",
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? "",
    });
  }

  return rows;
}

async function collectEntitlementRows(window) {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const rows = [];
  let fromIndex = 0;

  while (true) {
    const toIndex = fromIndex + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("entitlements")
      .select(
        "id, user_id, product_id, purchaser_email, source, stripe_checkout_session_id, granted_at, created_at"
      )
      .eq("source", "stripe_checkout")
      .not("stripe_checkout_session_id", "is", null)
      .gte("created_at", window.fromIso)
      .lt("created_at", window.toIsoExclusive)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(fromIndex, toIndex);

    if (error) {
      throw new Error(`Could not fetch entitlement rows from Supabase: ${error.message}`);
    }

    const pageRows = data ?? [];
    rows.push(...pageRows);
    if (pageRows.length < SUPABASE_PAGE_SIZE) {
      break;
    }
    fromIndex += SUPABASE_PAGE_SIZE;
  }

  return rows;
}

async function collectLiveInputs(args) {
  if (!args.fromDate || !args.toDate) {
    throw new Error("When using --collect-live, both --from and --to are required.");
  }

  const window = resolveDateRangeWindow(args.fromDate, args.toDate);
  const outputDir = resolveCollectOutputDir(args, window);
  const stripePath = path.join(
    outputDir,
    `stripe-checkout-sessions-${window.fromDate}-to-${window.toDate}.json`
  );
  const entitlementsPath = path.join(outputDir, `entitlements-${window.fromDate}-to-${window.toDate}.json`);

  const [stripeRows, entitlementRows] = await Promise.all([
    collectStripeRows(window),
    collectEntitlementRows(window),
  ]);

  await Promise.all([writeRowsJson(stripePath, stripeRows), writeRowsJson(entitlementsPath, entitlementRows)]);

  console.log(
    `[finance-reconcile] Collected live exports for ${window.fromDate}..${window.toDate} into ${outputDir}`
  );
  console.log(`[finance-reconcile] Stripe rows collected: ${stripeRows.length}`);
  console.log(`[finance-reconcile] Entitlement rows collected: ${entitlementRows.length}`);

  return { stripePath, entitlementsPath };
}

function printHelp() {
  console.log(`Usage:
  npm run finance:reconcile -- (--input-dir <dir> | --stripe <stripe.csv|stripe.json> --entitlements <entitlements.csv|entitlements.json> | --collect-live --from <YYYY-MM-DD> --to <YYYY-MM-DD>) [--collect-dir <dir>] [--write <report.json>] [--max-unexplained <n>]

Flags:
  --input-dir         Optional directory with exports; auto-picks latest matching files
  --stripe            Stripe export file path (required unless resolved via --input-dir)
  --entitlements      Entitlements export file path (required unless resolved via --input-dir)
  --collect-live      Auto-collect Stripe + Supabase exports for the date range before reconciliation
  --from              Start date (UTC, YYYY-MM-DD) for --collect-live
  --to                End date (UTC, YYYY-MM-DD, inclusive) for --collect-live
  --collect-dir       Optional directory for auto-collected export files
  --write             Optional output JSON report path
  --max-unexplained   Allowed mismatch count before failing (default: 0)
  --help              Show this help text`);
}

export function parseCliArgs(argv) {
  const args = {
    stripePath: "",
    entitlementsPath: "",
    inputDir: "",
    collectLive: false,
    fromDate: "",
    toDate: "",
    collectDir: "",
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
    if (token === "--input-dir") {
      args.inputDir = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--collect-live") {
      args.collectLive = true;
      continue;
    }
    if (token === "--from") {
      args.fromDate = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--to") {
      args.toDate = argv[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token === "--collect-dir") {
      args.collectDir = argv[i + 1] ?? "";
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

  if (args.collectLive && (args.inputDir || args.stripePath || args.entitlementsPath)) {
    throw new Error(
      "When using --collect-live, do not also pass --input-dir, --stripe, or --entitlements."
    );
  }

  const resolvedInputs = args.collectLive ? await collectLiveInputs(args) : await resolveInputPaths(args);

  if (!resolvedInputs.stripePath || !resolvedInputs.entitlementsPath) {
    throw new Error("Provide either --input-dir, or both --stripe and --entitlements.");
  }
  if (!Number.isFinite(args.maxUnexplainedMismatch) || args.maxUnexplainedMismatch < 0) {
    throw new Error("--max-unexplained must be a non-negative number.");
  }

  console.log(`[finance-reconcile] Using stripe file: ${resolvedInputs.stripePath}`);
  console.log(`[finance-reconcile] Using entitlement file: ${resolvedInputs.entitlementsPath}`);

  const [stripeRows, entitlementRows] = await Promise.all([
    loadRowsFromFile(resolvedInputs.stripePath),
    loadRowsFromFile(resolvedInputs.entitlementsPath),
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
