import { describe, expect, it } from "vitest";
import {
  buildFinanceReconciliationReport,
  parseCliArgs,
  parseCsv,
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
      outputPath: "artifacts/finance-reconciliation/latest.json",
      maxUnexplainedMismatch: 2,
      help: false,
    });
  });
});
