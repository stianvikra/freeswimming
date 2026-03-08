# Operations, Finance, and i18n Readiness Execution Log

## Purpose

Record actual execution of readiness runbooks/checklists so status is auditable, repeatable, and easy to continue.

## 2026-03-06 Slice 2 Baseline Validation

### Operations (Incident/Support) Dry Run

- Scope:
  - validate `docs/runbooks/core-flow-incident-response.md` against core routes (`/`, `/course`, `/my-library`, `/admin`).
- Result:
  - runbook flow is executable and clear for first response and containment.
  - route triage matrix and severity model are actionable.
- Improvement applied in this slice:
  - added locale-specific incident checks (`i18n triage overlay`) to avoid ambiguity in future multi-language incidents.

### Finance/Reporting Baseline Dry Run

- Scope:
  - validate `docs/checklists/finance-reporting-baseline.md` as weekly operator checklist.
- Result:
  - checklist is usable for manual weekly reconciliation.
  - escalation thresholds (`P0/P1/P2`) are clear enough for operations use.

### i18n Readiness Baseline Dry Run

- Scope:
  - validate `docs/checklists/i18n-operational-readiness.md` for pre-locale go/no-go.
- Result:
  - checklist captures route/content/admin/SEO/analytics reliability dimensions.
  - blocker log format is ready for owner/date tracking.

## 2026-03-08 Slice 5 Blocker-Closure Pass

### i18n Locale Routing Decision

- Scope:
  - lock route strategy and remove ambiguity from i18n readiness baseline.
- Result:
  - locale routing decision documented as `subpath` strategy:
    - `docs/decisions/locale-routing-strategy.md`
  - `OPS-FIN-I18N-001` is resolved.

### Finance Reconciliation Maturity

- Scope:
  - reduce manual reconciliation ambiguity using deterministic mismatch detection.
- Result:
  - added reconciliation CLI:
    - `scripts/reconcile-finance-entitlements.mjs`
    - `npm run finance:reconcile`
  - command now fails automatically on unexplained session-ID mismatch above threshold.
  - finance checklist updated with required automation command + evidence output path.
  - `OPS-FIN-I18N-002` is downgraded from `P1` to `P2` (input-export collection is still manual).

## Blocker Register

| ID               | Area       | Severity | Status   | Blocker                                                                          | Owner      | Target date | Current mitigation                                                                            | Follow-up link                                                                                |
| ---------------- | ---------- | -------- | -------- | -------------------------------------------------------------------------------- | ---------- | ----------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| OPS-FIN-I18N-001 | i18n       | P1       | resolved | Locale routing decision (`subpath` vs `domain`) is not yet locked.               | stianvikra | 2026-03-08  | Decision recorded in `docs/decisions/locale-routing-strategy.md`.                             | `docs/task-briefs/in-progress/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md` |
| OPS-FIN-I18N-002 | finance    | P2       | open     | Stripe-vs-entitlement export collection is still manual before reconciliation.   | stianvikra | 2026-03-21  | Stage weekly exports in one input dir and run `npm run finance:reconcile -- --input-dir ...`. | `docs/checklists/finance-reporting-baseline.md`                                               |
| OPS-FIN-I18N-003 | operations | P2       | open     | Incident note template/taxonomy is not yet standardized in admin notes workflow. | stianvikra | 2026-03-21  | Use current incident log format from runbook until template is formalized.                    | `docs/runbooks/core-flow-incident-response.md`                                                |

## Next Validation Cadence

- Re-run this log after first weekly finance pass using `npm run finance:reconcile`.
- Re-run after first locale fallback-matrix definition update.
