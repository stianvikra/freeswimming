import { describe, expect, it } from "vitest";

import {
  buildQualityGateReport,
  classifyQualityGateChanges,
  isDocsOnlyEligibleQualityGatePath,
} from "../../scripts/quality-gate-evidence.mjs";

const fullEvidenceBrief = `
# Task Brief: Example

Reference: docs/quality/platform-10-10-scorecard.md

## Stack / Architecture Best-Practice Gate

- Uses a quality-gate policy matrix and scorecard mapping.
- Reuses the reference surface or shared component where UI is touched.
- Session-step changes use docs/design/session-step-surface-contract.md and shared renderer.
- API and auth changes require validation, invariant, deterministic behavior, fail-closed authz, unauthorized 401/403 coverage, no unexpected 500 failure-mode evidence, and negative-path tests.
- Data work states server-canonical storage, migration, RLS, sync, cache, invalidation, freshness, forbidden/unauthorized negative-path evidence, and fail-closed behavior.
- External SDK work uses official docs, webhook verification, idempotency, retry, observability, diagnostic, support, failure, and negative-path evidence.

## Visual Evidence

- Screenshot artifacts use an artifact folder under output/ with before/after or after/reference naming.
- Owner screenshot approval stop is required for UI, PDF, export, print, and actual consumed artifact checks.
- UI changes include keyboard, focus, semantic, responsive, and a11y evidence.
- Use docs/runbooks/ui-debug-hypothesis-and-handoff.md for high-cost visual/export bugs.

## Help/Guide And Operator Training Impact

- Route-label-support-surface-impact-sweep covers impact sweep, Help/Guide, and support surface fallout.
- Impact sweep evidence includes identifiers searched, surfaces checked, and fallout handled.

## Security, Privacy, And Compliance

- No secrets, privacy leaks, sensitive data, or unsafe analytics event payloads.
- Stripe, entitlement, checkout, refund, invoice, reconciliation, finance, commerce, unauthorized, forbidden, and payment negative-path notes are required when touched.

## Observability And KPI Contract

- Analytics KPI event evidence must be no-PII and safe payload only.
- Performance budget, payload, cost, scale, route-level CWV, LCP, JS transfer, and payload budget evidence is required.
- i18n, locale, localization, and translation readiness evidence is required.
- Unknown surface classification rationale and stack-fit scope rationale are required for unclassified runtime files.

## Validation

- Targeted unit script tests, targeted tests, testing, QA automation, verify:pre-pr, rollback, devops, and reversible implementation.
`;

describe("quality gate evidence", () => {
  it("classifies changed files into multiple quality gate classes", () => {
    const classes = classifyQualityGateChanges([
      "components/my-library/workouts/WorkoutEditor.tsx",
      "app/api/contact/route.ts",
      "scripts/run-verify-docs-only.sh",
    ]).map((changeClass) => changeClass.id);

    expect(classes).toContain("ui_layout_brand");
    expect(classes).toContain("session_step_domain");
    expect(classes).toContain("api_server");
    expect(classes).toContain("devops_tooling");
  });

  it("keeps docs-only governance paths eligible for the fast lane", () => {
    expect(isDocsOnlyEligibleQualityGatePath("docs/runbooks/example.md")).toBe(true);
    expect(isDocsOnlyEligibleQualityGatePath("AGENTS.md")).toBe(true);
    expect(isDocsOnlyEligibleQualityGatePath("scripts/example.mjs")).toBe(false);
  });

  it("allows docs-only changes without an active implementation brief", () => {
    const report = buildQualityGateReport({
      changedFiles: ["docs/runbooks/local-verify-and-test-artifacts.md"],
      briefRecords: [],
    });

    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
  });

  it("fails non-docs changes without a changed in-progress brief", () => {
    const report = buildQualityGateReport({
      changedFiles: ["scripts/quality-gate-evidence.mjs"],
      briefRecords: [],
    });

    expect(report.ok).toBe(false);
    expect(report.errors).toContain(
      "Non-docs changes require a changed `docs/task-briefs/in-progress/...` brief so quality evidence is reviewable."
    );
  });

  it("fails when a triggered high-risk class lacks required brief evidence", () => {
    const report = buildQualityGateReport({
      changedFiles: ["components/my-library/workouts/WorkoutEditor.tsx"],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: "This brief mentions testing only.",
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.errors.join("\n")).toContain(
      "Session-step, workout, and program domain is missing standard brief evidence for session-step reference contract"
    );
    expect(report.errors.join("\n")).toContain(
      "UI, layout, and brand is missing blocking brief evidence for screenshot artifact handoff"
    );
  });

  it("requires blocking screenshot approval and naming evidence for UI changes", () => {
    const report = buildQualityGateReport({
      changedFiles: ["components/ExamplePanel.tsx"],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: `
            The implementation reuses the reference surface and shared component.
            Screenshot review will happen.
            Testing covers the changed behavior.
          `,
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "screenshot artifact handoff"
    );
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "owner screenshot approval stop"
    );
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "screenshot comparison naming"
    );
  });

  it("requires route sweep identifiers and checked surfaces for support changes", () => {
    const report = buildQualityGateReport({
      changedFiles: ["app/help/page.tsx"],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: `
            The route-label-support-surface-impact-sweep runbook is used.
            Screenshot artifacts use an artifact folder under output/ with before/after naming.
            Owner screenshot approval stop is required.
            The UI reuses a reference surface with keyboard, focus, semantic, and responsive evidence.
          `,
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "sweep identifiers and surfaces"
    );
  });

  it("requires payment negative-path evidence for commerce changes", () => {
    const report = buildQualityGateReport({
      changedFiles: ["app/api/stripe/checkout/route.ts"],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: `
            Uses official Stripe SDK docs, webhook verification, idempotency, retry, observability, diagnostic, support, and reconciliation evidence.
            API behavior has validation, invariant, deterministic, no unexpected 500, and fail-closed 401/403 coverage.
            Privacy and no secrets boundaries are documented.
          `,
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "payment negative-path evidence"
    );
  });

  it("requires route-level speed or payload evidence for performance changes", () => {
    const report = buildQualityGateReport({
      changedFiles: ["scripts/run-perf-budget-check.mjs"],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: `
            Performance, budget, payload, cost, scale, targeted unit script tests, verify:pre-pr, rollback, devops, and reversible implementation are documented.
          `,
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "route-level speed or payload target"
    );
  });

  it("requires classification rationale for unknown runtime surfaces", () => {
    const report = buildQualityGateReport({
      changedFiles: ["config/unclassified-runtime.json"],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: "Targeted tests and rollback evidence are present.",
        },
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.blockingMissingEvidence.map((evidence) => evidence.label)).toContain(
      "unknown surface classification rationale"
    );
  });

  it("passes mixed tooling and high-risk changes when required evidence is present", () => {
    const report = buildQualityGateReport({
      changedFiles: [
        "scripts/quality-gate-evidence.mjs",
        "tests/unit/quality-gate-evidence.test.ts",
        "components/my-library/workouts/WorkoutEditor.tsx",
        "app/api/contact/route.ts",
        "docs/quality/platform-10-10-scorecard.md",
      ],
      briefRecords: [
        {
          path: "docs/task-briefs/in-progress/2026-05-04-example.md",
          content: fullEvidenceBrief,
        },
      ],
    });

    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.humanJudgmentRequired.some((item) => item.includes("Security and authz"))).toBe(
      true
    );
  });
});
