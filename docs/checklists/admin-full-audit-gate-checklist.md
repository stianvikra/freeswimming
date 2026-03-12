# Full Admin Audit Gate Checklist

Use this checklist for AW-012 full-admin quality audit runs.

## Run Contract

- Run on current branch HEAD before PR update and before merge recommendation.
- Attach evidence to PR body or linked artifact path.
- Keep evidence SHA-bound to avoid stale pass claims.

## Required Commands

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` (or `npm run gate:pre-merge`)

## Critical Workflow Matrix

| ID   | Workflow                                   | Route/API Surface                                    | Expected Coverage                                                   | Evidence                                                                             |
| ---- | ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `A1` | Admin access gate and redirect correctness | `/admin`, `/login?next=/admin`, `/api/admin/content` | E2E positive and negative authz paths                               | `tests/e2e/admin-foundation.spec.ts`, `tests/e2e/admin-content-api-guards.spec.ts`   |
| `A2` | Core content workspace mutation safety     | `/admin` content tabs and mutation APIs              | Valid + malformed payload behavior is deterministic                 | `tests/e2e/admin-content-api-guards.spec.ts`                                         |
| `A3` | DB-canonical content parity visibility     | `/admin` workspace mirrors DB rows                   | Snapshot/list parity evidence present                               | `tests/e2e/admin-content-parity.spec.ts`                                             |
| `A4` | Notes workflows (global + contextual)      | `/admin`, `/course`, `/plans`                        | CRUD + status toggles + contextual linkage                          | `tests/e2e/admin-notes-workflow.spec.ts`, `tests/e2e/admin-contextual-notes.spec.ts` |
| `A5` | Preview mode safety and rendering          | preview APIs and open-preview links                  | Unauthorized access fails closed and preview banner/noindex renders | `tests/e2e/admin-preview-mode.spec.ts`                                               |
| `A6` | Help/Guide operations discoverability      | `/admin` Help tab                                    | Non-technical workflow guidance stays accessible                    | `tests/e2e/admin-help-center.spec.ts`                                                |
| `A7` | Email template governance workflow         | admin email template flows                           | Preview/fallback/missing-placeholder behavior is explicit           | `tests/e2e/admin-email-templates-preview.spec.ts`                                    |

## Scoring Rubric (0-5)

- `5`: fully deterministic, evidence current, no open P0/P1 issues.
- `4`: release-safe with minor non-blocking gaps and explicit follow-up owner.
- `3`: partial coverage, at least one unresolved release-risk gap.
- `2`: major workflow uncertainty or weak negative-path proof.
- `1`: basic behavior unstable or unverified.
- `0`: no reliable evidence.

## Release Decision Rules

- Release gate: all `target` categories `>=4/5`.
- 10/10 claim gate: critical target categories are each `5/5`:
  - UX flow clarity
  - Business logic correctness and data integrity
  - Security and authz
  - Admin workflow and editability
  - Testing and QA automation
  - DevOps and rollback readiness
- Any open P0 finding blocks merge recommendation.

## Remediation Queue Template

| Finding ID | Severity (`P0/P1/P2`) | Workflow ID | Gap Summary                                             | Owner | Target Date  | Evidence To Close       | Status |
| ---------- | --------------------- | ----------- | ------------------------------------------------------- | ----- | ------------ | ----------------------- | ------ |
| `TBD`      | `P1`                  | `A2`        | Example: invalid payload error copy unclear in admin UI | `TBD` | `YYYY-MM-DD` | linked PR + test update | `open` |

## Cadence

- Minimum cadence: rerun on every admin-affecting PR before merge.
- Full audit cadence: weekly while AW-012 is in progress, then at least monthly.
- Re-run immediately after authz, workflow state-model, or admin mutation contract changes.
