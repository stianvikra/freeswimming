#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { collectChangedFiles, resolveBaseRef } from "./verification-scope.mjs";

const SUPABASE_MIGRATION_PATTERN = /^supabase\/migrations\/[^/]+\.sql$/;
const ALLOW_PENDING_ENV = "SUPABASE_MIGRATION_DRIFT_ALLOW_PENDING";

function normalizeGitPath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "").trim();
}

export function isSupabaseMigrationFile(filePath) {
  return SUPABASE_MIGRATION_PATTERN.test(normalizeGitPath(filePath));
}

export function getChangedSupabaseMigrationFiles(changedFiles) {
  return Array.from(
    new Set(changedFiles.map(normalizeGitPath).filter(isSupabaseMigrationFile))
  ).sort((left, right) => left.localeCompare(right));
}

export function parsePendingSupabaseMigrations(dryRunOutput) {
  const output = dryRunOutput ?? "";
  const markerIndex = output.toLowerCase().indexOf("would push these migrations:");
  if (markerIndex === -1) return [];

  const afterMarker = output.slice(markerIndex).split(/\r?\n/).slice(1);
  const migrations = [];

  for (const line of afterMarker) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^finished supabase db push\./i.test(trimmed)) break;

    const match = trimmed.match(/^(?:[-*]|\u2022)\s+(.+\.sql)$/i);
    if (match?.[1]) {
      migrations.push(match[1].trim());
    }
  }

  return migrations;
}

export function evaluateSupabaseMigrationDrift({
  changedFiles,
  dryRunStatus,
  dryRunOutput,
  allowPending = false,
}) {
  const changedMigrationFiles = getChangedSupabaseMigrationFiles(changedFiles);

  if (changedMigrationFiles.length === 0) {
    return {
      ok: true,
      kind: "skipped",
      changedMigrationFiles,
      pendingMigrations: [],
      message: "No changed Supabase migration files detected.",
    };
  }

  const output = dryRunOutput ?? "";
  const pendingMigrations = parsePendingSupabaseMigrations(output);

  if (dryRunStatus !== 0) {
    return {
      ok: false,
      kind: "dry-run-failed",
      changedMigrationFiles,
      pendingMigrations,
      message: "Supabase migration drift check could not inspect the linked remote database.",
    };
  }

  if (pendingMigrations.length > 0) {
    return {
      ok: allowPending,
      kind: allowPending ? "pending-allowed" : "pending-blocked",
      changedMigrationFiles,
      pendingMigrations,
      message: allowPending
        ? `Pending Supabase migration(s) allowed by ${ALLOW_PENDING_ENV}=1.`
        : "Changed Supabase migration file(s) have not been applied to the linked remote database.",
    };
  }

  if (/remote database is up to date\./i.test(output)) {
    return {
      ok: true,
      kind: "up-to-date",
      changedMigrationFiles,
      pendingMigrations,
      message: "Linked Supabase remote database is up to date.",
    };
  }

  return {
    ok: false,
    kind: "unknown-dry-run-output",
    changedMigrationFiles,
    pendingMigrations,
    message:
      "Supabase dry-run output did not confirm whether the linked remote database is up to date.",
  };
}

function runSupabaseDryRun() {
  const result = spawnSync("npx", ["supabase", "db", "push", "--dry-run", "--linked"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

function printList(label, values) {
  if (values.length === 0) return;
  console.error(`[supabase-migration-drift] ${label}:`);
  for (const value of values) {
    console.error(`- ${value}`);
  }
}

function main() {
  const baseRef = resolveBaseRef();
  const changedFiles = collectChangedFiles(baseRef);
  const changedMigrationFiles = getChangedSupabaseMigrationFiles(changedFiles);

  if (changedMigrationFiles.length === 0) {
    console.log("[supabase-migration-drift] SKIP: no changed Supabase migrations.");
    return;
  }

  console.log(`[supabase-migration-drift] Base ref: ${baseRef}`);
  console.log("[supabase-migration-drift] Changed Supabase migrations:");
  for (const filePath of changedMigrationFiles) {
    console.log(`- ${filePath}`);
  }
  console.log("[supabase-migration-drift] Running linked Supabase dry-run.");

  const dryRun = runSupabaseDryRun();
  const result = evaluateSupabaseMigrationDrift({
    changedFiles,
    dryRunStatus: dryRun.status,
    dryRunOutput: dryRun.output,
    allowPending: process.env[ALLOW_PENDING_ENV] === "1",
  });

  if (result.ok) {
    const level = result.kind === "pending-allowed" ? "WARN" : "PASS";
    console.log(`[supabase-migration-drift] ${level}: ${result.message}`);
    if (result.pendingMigrations.length > 0) {
      printList("Pending migration(s)", result.pendingMigrations);
    }
    return;
  }

  console.error(`[supabase-migration-drift] FAIL: ${result.message}`);
  printList("Changed migration file(s)", result.changedMigrationFiles);
  printList("Pending migration(s)", result.pendingMigrations);
  console.error("[supabase-migration-drift] Command: npx supabase db push --dry-run --linked");
  console.error(
    `[supabase-migration-drift] To intentionally ship app code before applying schema, set ${ALLOW_PENDING_ENV}=1 and record the rollout rationale in the active brief/PR.`
  );
  if (dryRun.output.trim()) {
    console.error("[supabase-migration-drift] Dry-run output:");
    console.error(dryRun.output.trim());
  }
  process.exit(1);
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryHref) {
  main();
}
