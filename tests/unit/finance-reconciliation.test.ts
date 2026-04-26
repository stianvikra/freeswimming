import { mkdtemp, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFinanceReconciliationReport,
  collectStripeSessionRows,
  parseCliArgs,
  parseCsv,
  resolveDateRangeWindow,
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

describe("collectStripeSessionRows", () => {
  it("collects invoice fields from the Stripe SDK async iterable list", async () => {
    async function* sessions() {
      yield {
        id: "session_fixture_paid",
        payment_status: "paid",
        status: "complete",
        created: 1777226400,
        customer: "customer_fixture",
        invoice: { id: "invoice_fixture" },
        invoice_creation: { enabled: true },
        client_reference_id: "11111111-1111-4111-8111-111111111111",
        metadata: { fs_product_id: "guide_0_1000m" },
        customer_details: { email: null },
        amount_total: 9900,
        currency: "usd",
      };
    }

    await expect(collectStripeSessionRows(sessions())).resolves.toEqual([
      {
        id: "session_fixture_paid",
        payment_status: "paid",
        status: "complete",
        created: 1777226400,
        customer: "customer_fixture",
        invoice: "invoice_fixture",
        invoice_creation_enabled: true,
        client_reference_id: "11111111-1111-4111-8111-111111111111",
        metadata_product_id: "guide_0_1000m",
        customer_email: "",
        amount_total: 9900,
        currency: "usd",
      },
    ]);
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

  it("parses collect-live flags", () => {
    const args = parseCliArgs([
      "--collect-live",
      "--from",
      "2026-03-01",
      "--to",
      "2026-03-07",
      "--collect-dir",
      "artifacts/finance-exports/live",
      "--max-unexplained",
      "1",
    ]);

    expect(args).toMatchObject({
      collectLive: true,
      fromDate: "2026-03-01",
      toDate: "2026-03-07",
      collectDir: "artifacts/finance-exports/live",
      maxUnexplainedMismatch: 1,
      help: false,
    });
  });
});

describe("resolveDateRangeWindow", () => {
  it("returns inclusive date window for stripe and supabase filters", () => {
    const window = resolveDateRangeWindow("2026-03-01", "2026-03-07");

    expect(window).toEqual({
      fromDate: "2026-03-01",
      toDate: "2026-03-07",
      fromIso: "2026-03-01T00:00:00.000Z",
      toIsoExclusive: "2026-03-08T00:00:00.000Z",
      stripeCreatedGte: 1772323200,
      stripeCreatedLte: 1772927999,
    });
  });

  it("throws when date format is invalid", () => {
    expect(() => resolveDateRangeWindow("03-01-2026", "2026-03-07")).toThrow(
      "--from must use YYYY-MM-DD format."
    );
  });

  it("throws when --to is before --from", () => {
    expect(() => resolveDateRangeWindow("2026-03-08", "2026-03-07")).toThrow(
      "--to must be on or after --from."
    );
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
