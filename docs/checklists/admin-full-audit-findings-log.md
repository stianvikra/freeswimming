# Full Admin Audit Findings Log

Use this log with `docs/checklists/admin-full-audit-gate-checklist.md` for AW-012 audit runs.

## Run Metadata

| Field            | Value                                                |
| ---------------- | ---------------------------------------------------- |
| Run date         | `2026-06-18`                                         |
| Branch           | `admin-audit-coverage-users-readability-drift`       |
| Commit SHA       | `pending`                                            |
| Run type         | `active-module-coverage-reconcile`                   |
| Reviewer         | `stianvikra`                                         |
| Checklist source | `docs/checklists/admin-full-audit-gate-checklist.md` |

## Workflow Scores (0-5)

| ID    | Workflow                                       | Score (0-5) | Evidence                                                                                                                      | Gap Summary                                                                                               | Status  |
| ----- | ---------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| `A1`  | Admin access gate and redirect correctness     | `5`         | `tests/e2e/admin-foundation.spec.ts`, `tests/e2e/admin-content-api-guards.spec.ts`                                            | No baseline gap.                                                                                          | `pass`  |
| `A2`  | Core content workspace mutation safety         | `5`         | `tests/e2e/admin-content-api-guards.spec.ts`                                                                                  | Malformed payload message contract now asserted for create and patch mutation paths.                      | `pass`  |
| `A3`  | DB-canonical content parity visibility         | `5`         | `tests/e2e/admin-content-parity.spec.ts`, `docs/runbooks/admin-content-parity-triage.md`                                      | Weekly parity triage flow now codified with explicit checkpoint evidence contract.                        | `pass`  |
| `A4`  | Notes workflows (global + contextual)          | `5`         | `tests/e2e/admin-notes-workflow.spec.ts`, `tests/e2e/admin-contextual-notes.spec.ts`, `docs/runbooks/admin-notes-recovery.md` | Manual stale-note reconciliation walkthrough is now codified with deterministic evidence note contract.   | `pass`  |
| `A5`  | Preview mode safety and rendering              | `5`         | `tests/e2e/admin-preview-mode.spec.ts`                                                                                        | No baseline gap.                                                                                          | `pass`  |
| `A6`  | Help/Guide operations discoverability          | `5`         | `tests/e2e/admin-help-center.spec.ts`                                                                                         | No baseline gap.                                                                                          | `pass`  |
| `A7`  | Email template governance workflow             | `5`         | `tests/e2e/admin-email-templates-preview.spec.ts`                                                                             | Published-state regression now asserts fallback-copy rendering and invalid preview-JSON resilience.       | `pass`  |
| `A8`  | QR registry ownership and redirects            | `4`         | `tests/e2e/admin-foundation.spec.ts`                                                                                          | Active workflow is now tracked in the matrix; next full audit should attach dedicated QR route evidence.  | `watch` |
| `A9`  | Commerce admin product visibility              | `4`         | `tests/e2e/admin-foundation.spec.ts`                                                                                          | Active workflow is now tracked in the matrix; next full audit should attach product API guard evidence.   | `watch` |
| `A10` | Operations runtime flag safety                 | `4`         | `tests/e2e/admin-foundation.spec.ts`                                                                                          | Active workflow is now tracked in the matrix; next full audit should attach operations mutation evidence. | `watch` |
| `A11` | Analytics read-only insights                   | `4`         | `tests/e2e/admin-console-a11y-audit.spec.ts`                                                                                  | Active workflow is now in broad a11y coverage; next full audit should attach dashboard/unit evidence.     | `watch` |
| `A12` | Users account/access/support and role controls | `4`         | `tests/e2e/admin-users-overview.spec.ts`, `tests/unit/admin-users-manager.test.tsx`                                           | Active workflow has privacy/role-control evidence; next full audit should attach route negative paths.    | `watch` |
| `A13` | Messages inbox and diagnostics                 | `4`         | `tests/e2e/admin-foundation.spec.ts`                                                                                          | Active workflow is now tracked in the matrix; next full audit should attach message workflow evidence.    | `watch` |
| `A14` | Category taxonomy workflow                     | `4`         | `tests/e2e/admin-foundation.spec.ts`                                                                                          | Active workflow is now tracked in the matrix; next full audit should attach category mutation evidence.   | `watch` |

## Findings Register

| Finding ID | Severity (P0/P1/P2) | Workflow ID | Gap Summary                                                                                                                 | Owner        | Target Date  | Evidence To Close                                                                            | Status   |
| ---------- | ------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------ | -------------------------------------------------------------------------------------------- | -------- |
| `F001`     | `P1`                | `A2`        | Missing explicit malformed-payload message assertion in admin mutation workflow evidence.                                   | `stianvikra` | `2026-03-12` | `tests/e2e/admin-content-api-guards.spec.ts` + slice-4 PR                                    | `closed` |
| `F002`     | `P2`                | `A3`        | Weekly parity triage flow needs explicit operator note in AW-012 checkpoint log evidence.                                   | `stianvikra` | `2026-03-12` | `docs/runbooks/admin-content-parity-triage.md` + AW-012 slice-5 checkpoint + parity run PASS | `closed` |
| `F003`     | `P2`                | `A7`        | Publish fallback copy contract needs one extra regression assertion for resilience.                                         | `stianvikra` | `2026-03-12` | `tests/e2e/admin-email-templates-preview.spec.ts` + AW-012 slice-6 checkpoint                | `closed` |
| `F004`     | `P2`                | `A4`        | Stale-note reconciliation lacked a short deterministic manual recovery walkthrough note.                                    | `stianvikra` | `2026-03-12` | `docs/runbooks/admin-notes-recovery.md` + AW-012 slice-7 checkpoint                          | `closed` |
| `F005`     | `P2`                | `A8`        | QR registry is tracked in the matrix but still needs dedicated evidence in the next full audit.                             | `stianvikra` | `2026-07-31` | Dedicated QR audit evidence + PR/check run                                                   | `open`   |
| `F006`     | `P2`                | `A9`        | Commerce admin product visibility is tracked in the matrix but still needs dedicated evidence in the next full audit.       | `stianvikra` | `2026-07-31` | Product admin audit evidence + PR/check run                                                  | `open`   |
| `F007`     | `P2`                | `A10`       | Operations runtime flags are tracked in the matrix but still need dedicated mutation/guard evidence in the next full audit. | `stianvikra` | `2026-07-31` | Operations audit evidence + PR/check run                                                     | `open`   |
| `F008`     | `P2`                | `A11`       | Analytics is now in broad a11y coverage but still needs full dashboard/unit evidence in the next full audit.                | `stianvikra` | `2026-07-31` | Analytics audit evidence + PR/check run                                                      | `open`   |
| `F009`     | `P2`                | `A12`       | Users has privacy/role-control evidence but still needs route negative-path evidence attached in the next full audit.       | `stianvikra` | `2026-07-31` | Users route/audit evidence + PR/check run                                                    | `open`   |
| `F010`     | `P2`                | `A13`       | Messages is tracked in the matrix but still needs dedicated inbox/diagnostics evidence in the next full audit.              | `stianvikra` | `2026-07-31` | Messages audit evidence + PR/check run                                                       | `open`   |
| `F011`     | `P2`                | `A14`       | Category taxonomy is tracked in the matrix but still needs dedicated mutation evidence in the next full audit.              | `stianvikra` | `2026-07-31` | Category audit evidence + PR/check run                                                       | `open`   |

## Release Gate Snapshot

- Release gate (`>=4/5` on target categories): `PASS` for active-module coverage reconcile.
- 10/10 claim gate (critical categories all `5/5`): `NO`; A8-A14 are now tracked but require next full audit evidence before a full-admin 10/10 claim.
- Open `P0` findings: `0`.
