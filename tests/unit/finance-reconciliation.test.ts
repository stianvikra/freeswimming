import { mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFinanceReconciliationReport,
  parseCliArgs,
  parseCsv,
  resolveInputPaths,
} from "../../scripts/reconcile-finance-entitlements.mjs";

describe("parseCsv", () => {
  it("parses quoted CSV cells and escaped quotes", () => {
    const rows = parseCsv(
      'id,payment_status,notes\ncs_1,paid,"first, with comma"\ncs_2,open,"quote ""inside"""'
    );

    expect(rows).toEqual([
      {
        id: "cs_1",
        payment_status: "paid",
        notes: "first, with comma",
      },
      {
        id: "cs_2",
        payment_status: "open",
        notes: 'quote "inside"',
      },
    ]);
  });
});

describe("buildFinanceReconciliationReport", () => {
  it("detects missing, orphan, and duplicate session IDs", () => {
    const report = buildFinanceReconciliationReport(
      [
        { id: "cs_paid_1", payment_status: "paid" },
        { id: "cs_paid_2", payment_status: "paid" },
        { id: "cs_paid_2", payment_status: "paid" },
        { id: "cs_pending", payment_status: "open" },
        { id: "", payment_status: "paid" },
      ],
      [
        { stripe_checkout_session_id: "cs_paid_2" },
        { stripe_checkout_session_id: "cs_orphan_1" },
        { stripe_checkout_session_id: "cs_orphan_1" },
      ],
      { maxUnexplainedMismatch: 0 }
    );

    expect(report.stripePaidSessionCount).toBe(2);
    expect(report.entitlementSessionCount).toBe(2);
    expect(report.missingEntitlementSessionIds).toEqual(["cs_paid_1"]);
    expect(report.orphanEntitlementSessionIds).toEqual(["cs_orphan_1"]);
    expect(report.duplicateStripeSessionIds).toEqual(["cs_paid_2"]);
    expect(report.duplicateEntitlementSessionIds).toEqual(["cs_orphan_1"]);
    expect(report.skippedStripeUnpaidCount).toBe(1);
    expect(report.skippedStripeMissingSessionIdCount).toBe(1);
    expect(report.unexplainedMismatchCount).toBe(4);
    expect(report.pass).toBe(false);
  });

  it("respects allowed mismatch threshold", () => {
    const report = buildFinanceReconciliationReport([{ id: "cs_1", payment_status: "paid" }], [], {
      maxUnexplainedMismatch: 1,
    });

    expect(report.unexplainedMismatchCount).toBe(1);
    expect(report.pass).toBe(true);
  });
});

describe("parseCliArgs", () => {
  it("parses required and optional flags", () => {
    const args = parseCliArgs([
      "--input-dir",
      "artifacts/finance-exports/2026-w10",
      "--stripe",
      "stripe.csv",
      "--entitlements",
      "entitlements.csv",
      "--write",
      "artifacts/finance-reconciliation/latest.json",
      "--max-unexplained",
      "2",
    ]);

    expect(args).toMatchObject({
      stripePath: "stripe.csv",
      entitlementsPath: "entitlements.csv",
      inputDir: "artifacts/finance-exports/2026-w10",
      outputPath: "artifacts/finance-reconciliation/latest.json",
      maxUnexplainedMismatch: 2,
      help: false,
    });
  });
});

describe("resolveInputPaths", () => {
  it("resolves latest matching files from input dir", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "finance-reconcile-"));

    try {
      const stripeOld = path.join(tempDir, "stripe-export-older.csv");
      const stripeNew = path.join(tempDir, "stripe-export-newer.csv");
      const entitlementOld = path.join(tempDir, "entitlements-older.csv");
      const entitlementNew = path.join(tempDir, "entitlements-newer.csv");

      await writeFile(stripeOld, "id,payment_status\ncs_old,paid\n", "utf8");
      await writeFile(stripeNew, "id,payment_status\ncs_new,paid\n", "utf8");
      await writeFile(entitlementOld, "stripe_checkout_session_id\ncs_old\n", "utf8");
      await writeFile(entitlementNew, "stripe_checkout_session_id\ncs_new\n", "utf8");

      await utimes(stripeOld, new Date("2026-01-01T00:00:00Z"), new Date("2026-01-01T00:00:00Z"));
      await utimes(stripeNew, new Date("2026-01-02T00:00:00Z"), new Date("2026-01-02T00:00:00Z"));
      await utimes(
        entitlementOld,
        new Date("2026-01-01T00:00:00Z"),
        new Date("2026-01-01T00:00:00Z")
      );
      await utimes(
        entitlementNew,
        new Date("2026-01-02T00:00:00Z"),
        new Date("2026-01-02T00:00:00Z")
      );

      const resolved = await resolveInputPaths({
        stripePath: "",
        entitlementsPath: "",
        inputDir: tempDir,
      });

      expect(resolved).toEqual({
        stripePath: stripeNew,
        entitlementsPath: entitlementNew,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("keeps explicit paths when provided", async () => {
    const resolved = await resolveInputPaths({
      stripePath: "stripe.csv",
      entitlementsPath: "entitlements.csv",
      inputDir: "unused-dir",
    });

    expect(resolved).toEqual({
      stripePath: "stripe.csv",
      entitlementsPath: "entitlements.csv",
    });
  });
});
