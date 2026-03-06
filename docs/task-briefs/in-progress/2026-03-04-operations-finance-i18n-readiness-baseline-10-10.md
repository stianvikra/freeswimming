# Task Brief: Operations, Finance, and i18n Readiness Baseline (10/10)

## Metadata

- `id`: `2026-03-04-operations-finance-i18n-readiness-baseline-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-04`
- `updated`: `2026-03-06`

## Goal

Establish production-safe operational readiness for core flows (`/`, `/course`, `/my-library`, `/admin`) across incident/support response, finance/reporting confidence, and i18n expansion readiness.

## Why This Brief Exists

- Core user/admin flows are stable enough to continue content production.
- Readiness categories (`incident/support`, `finance/reporting`, `i18n`) are important before scale, but are not primary blockers for daily content entry right now.
- We need explicit baseline controls so these areas move from implicit assumptions to auditable contracts.

## Gap Trigger (Why This Is A New Brief)

- Triggered by core-flow gap scan on `2026-03-04` with the policy: create new briefs only for `target-score <4`.
- Scan result for this track: `3/5` (non-blocking for immediate content entry, but below target threshold for 10/10 readiness planning).
- This brief captures the concrete follow-up needed to raise this area to `>=4/5` and eventually `5/5` where required.

## Dependencies And Boundaries

- Uses current source-of-truth/content/admin foundations:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Related planned work with no overlap:
  - SEO/AI: `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`
  - performance/security hardening: `docs/task-briefs/planned/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`
  - QR redirect operations: `docs/task-briefs/done/2026-02-28-qr-video-redirect-links-and-admin-controls-10-10.md`

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - identity, entitlements, content entities, progress rows, audit trails, commerce transaction identifiers.
- Local-only:
  - UI preferences and transient unsaved state that do not affect business truth.
- Sync policy:
  - server responses remain source of truth for content/progress/entitlements,
  - readiness checks document how to detect and recover from stale/conflicting state.
- Retention/sensitivity:
  - no sensitive values in support diagnostics or operational runbooks.
- Cache/invalidation:
  - document route-level freshness expectations and invalidation triggers for changed core reads.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                 | Evidence                               |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------- | -------------------------------------- |
| Product goals and IA                          | `supporting` | N/A                                                                              | N/A                                    |
| UX flow clarity                               | `target`     | Incident/help paths for core flows have clear next-step guidance.                | runbook walkthrough + QA notes         |
| Visual design quality                         | `supporting` | N/A                                                                              | N/A                                    |
| Business logic correctness and data integrity | `target`     | Reporting/ops checks detect data mismatch deterministically (no silent drift).   | unit checks + reconciliation checklist |
| Admin editor ergonomics                       | `supporting` | N/A                                                                              | N/A                                    |
| Accessibility (a11y)                          | `supporting` | N/A                                                                              | N/A                                    |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                              | N/A                                    |
| Data placement and sync boundaries            | `target`     | Local/server ownership is explicitly documented for all core-flow state.         | brief contract + code references       |
| Caching and invalidation strategy             | `supporting` | N/A                                                                              | N/A                                    |
| Reliability and failure handling              | `target`     | Core failures map to actionable runbook steps with no ambiguous escalation path. | runbook simulation                     |
| Security and authz                            | `target`     | Operational procedures preserve fail-closed authz posture.                       | negative-path test references          |
| Privacy and compliance                        | `target`     | Support/reporting diagnostics redact sensitive data by default.                  | log/event review checklist             |
| Content governance                            | `supporting` | N/A                                                                              | N/A                                    |
| Admin workflow and editability                | `supporting` | N/A                                                                              | N/A                                    |
| SEO and crawlability                          | `supporting` | N/A                                                                              | N/A                                    |
| AI discoverability                            | `supporting` | N/A                                                                              | N/A                                    |
| Analytics and KPI observability               | `target`     | Required ops/reconciliation events are defined with safe payload contracts.      | event contract list                    |
| Commerce and revenue ops                      | `target`     | Entitlement/checkout/reporting IDs remain traceable and reconcilable end-to-end. | reconciliation test plan               |
| Incident response and support operations      | `target`     | P1/P0 incident response path is documented and runnable in <= 10 minutes.        | tabletop run output                    |
| Finance and reporting operations              | `target`     | Weekly baseline report checks are documented and reproducible.                   | reporting checklist                    |
| i18n operational readiness                    | `target`     | No critical blockers for adding locale routing/content metadata are unresolved.  | i18n readiness audit                   |
| Stack-fit and dependency discipline           | `target`     | No unnecessary dependency growth for readiness baseline.                         | dependency diff                        |
| Testing and QA automation                     | `target`     | Readiness-sensitive negative paths are covered by existing or added tests.       | test evidence                          |
| Scalability and cost efficiency               | `supporting` | N/A                                                                              | N/A                                    |
| DevOps and rollback readiness                 | `target`     | Rollback/escalation checklist exists for core-flow regressions.                  | rollback runbook                       |

## Scope

- Define and document operational readiness baseline for:
  - incident/support handling for core routes and critical APIs,
  - finance/reporting validation around entitlements/checkout metadata,
  - i18n expansion readiness audit and blockers list.
- Add/refresh deterministic checklists:
  - incident triage,
  - reconciliation checks,
  - i18n schema/route readiness checks.
- Add minimal targeted test/assertion references for critical negative paths where missing.
- Publish baseline artifacts in this slice:
  - incident/support runbook: `docs/runbooks/core-flow-incident-response.md`,
  - finance/reporting checklist: `docs/checklists/finance-reporting-baseline.md`,
  - i18n readiness checklist: `docs/checklists/i18n-operational-readiness.md`.

## Out Of Scope

- Full localization rollout (copy translation, locale UX, language switcher).
- Full BI dashboard implementation.
- Organization-wide on-call tooling rollout outside repo scope.

## Acceptance Criteria

1. Core-flow incident/support runbook exists with clear owner/escalation path.
2. Finance/reporting baseline checklist exists and is reproducible.
3. i18n readiness audit identifies blockers with owner/date.
4. Security/privacy handling for support/reporting diagnostics is explicit and fail-safe.
5. Any newly discovered critical gaps are linked to concrete follow-up briefs.

## Slice 1 Deliverables (2026-03-06)

- Created runbook/checklist baseline for this brief:
  - `docs/runbooks/core-flow-incident-response.md`
  - `docs/checklists/finance-reporting-baseline.md`
  - `docs/checklists/i18n-operational-readiness.md`
- Outcome target for Slice 1:
  - move readiness evidence from implicit to explicit and repeatable,
  - enable quick operational execution without requiring implementation context.

## Slice 2 Deliverables (2026-03-06)

- Validated baseline artifacts through one documented dry-run execution:
  - `docs/checklists/operations-finance-i18n-readiness-log.md`
- Added locale-incident guardrails to operations runbook:
  - `docs/runbooks/core-flow-incident-response.md` (`i18n triage overlay`).
- Logged first blocker set with severity, owner, and target date in the execution log.

## Slice 3 Deliverables (2026-03-06)

- Added automated PR-governance scaffolding so readiness requirements are enforced in routine delivery:
  - PR body auto-generation from active brief + latest local verify snapshot:
    - `scripts/generate-pr-body.mjs`
  - Safari PR create/update flow now uses generated structured body by default:
    - `scripts/pr-create-safari.sh`
  - CI verify workflow now fails pull requests with missing/empty required PR body sections:
    - `.github/workflows/ci.yml`
    - `scripts/lint-pr-body-sections.mjs`
- Outcome target for Slice 3:
  - reduce manual drift in PR evidence quality,
  - keep ops/finance/i18n governance visible and auditable in every PR/merge cycle.

## Current Readiness Snapshot (Post Slice 3)

- Incident/support operations: `4/5` (runbook executable, blockers tracked).
- Finance/reporting operations: `4/5` (manual baseline is clear; automation gap logged).
- i18n operational readiness: `3/5` (checklist ready; routing decision blocker still open).

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- targeted e2e/negative-path checks for touched contracts
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/course`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/admin`
- Preview:
  - PR Vercel URL for runbook spot-check links

## 10/10 Quality Bar

- Runbooks must be concise, executable, and owner-assigned.
- No vague “investigate” steps without concrete commands or log locations.
- Support/finance/i18n readiness checks must be reproducible by someone other than author.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-07 | 141e58f (main) | Slice 3 merged and closed in PR #145 | shipped PR-governance automation (auto PR-body generation + required-section CI lint + Safari PR body refresh flow); local post-merge sync completed | next: continue blocker closure for locale routing decision + finance reconciliation process maturity`
- `2026-03-04 | planned | brief created from core-flow gap scan to cover non-blocking readiness categories (incident/finance/i18n) | next: prioritize slice and move to in-progress when implementation starts`
- `2026-03-06 | working tree | moved brief to in-progress and delivered Slice 1 baseline artifacts (incident runbook + finance checklist + i18n checklist) | next: validate runbook steps against current admin/public routes and log first blockers with owner/date`
- `2026-03-06 | working tree | delivered Slice 2 validation pass: added execution log and first blocker register (owner/target-date), and extended incident runbook with i18n triage overlay | next: keep brief in-progress and close open P1 blockers (locale routing decision + finance reconciliation process maturity)`
- `2026-03-06 | working tree | delivered Slice 3 PR-governance automation: added auto PR-body generation + CI required-section lint and wired Safari PR create/update flow to structured body defaults | next: open/update PR, run required CI, and merge; then continue blocker closure work for locale routing + finance process maturity`
