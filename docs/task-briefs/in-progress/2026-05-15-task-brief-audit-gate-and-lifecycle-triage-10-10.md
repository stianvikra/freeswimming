# Task Brief: Task Brief Audit Gate And Lifecycle Triage (10/10)

## Metadata

- `id`: `2026-05-15-task-brief-audit-gate-and-lifecycle-triage-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-15`
- `updated`: `2026-05-15`

## Goal

Make brief usage systematic by adding a reusable Brief Audit Record standard, documenting the audit gate, and marking existing planned/in-progress briefs with a clear refresh-before-use status.

## Brief Audit Record

- `last_audited`: `2026-05-15`
- `base`: `main@b2a211f`
- `audit_status`: `ready`
- `decision`: Execute as a docs-only governance slice.
- `reason`: Owner explicitly asked to do the brief-audit standard and existing-brief triage end to end after the Phase 2A App Knowledge Book planning discussion.
- `must_refresh_before_execution_if`: repo quality-gate rules, task-brief lifecycle folders, scorecard categories, or AGENTS.md delivery contract change before this PR is opened.

## Why This Brief Exists

The repo already has strong task-brief scorecard requirements, but there is not yet a consistent pre-use audit record that tells an agent whether a planned or long-running in-progress brief is ready, stale, blocked, or must be revised before execution.

This creates two risks:

- old briefs can be executed against stale repo assumptions,
- new briefs can be created without recording the base commit, scope decision, and refresh trigger.

This slice adds a small docs-only governance layer so future implementation work starts from a known audit status.

## Scope

- Add a reusable Brief Audit Record requirement to `docs/task-brief-template.md`.
- Add lifecycle guidance to `docs/task-briefs/README.md`.
- Add a runbook/checklist at `docs/runbooks/task-brief-audit-gate.md`.
- Add a Brief Audit Record to the new Phase 2A App Knowledge Book planned brief.
- Add a conservative Brief Audit Record to existing `planned/` and `in-progress/` briefs:
  - default status is `revise-before-use`,
  - do not claim old briefs are ready unless they are explicitly audited in the active workstream,
  - do not edit `done/`, `blocked/`, or `deferred/` briefs in this slice.

## Out Of Scope

- No runtime code changes.
- No UI, print, layout, brand, screenshot, or interaction changes.
- No scripts, workflows, tests, package/config, dependency, migration, provider, or generated inventory changes.
- No broad rewrite of old brief scope, acceptance criteria, or scorecard mappings.
- No moving existing planned briefs to `in-progress`.
- No moving any brief to `done`.
- No claims that existing stale briefs are implementation-ready without a future scoped audit.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only governance slice:

- Product goals and IA
- Business logic correctness and data integrity
- Content governance
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                       | Evidence                                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Brief lifecycle has one clear pre-use audit standard and existing planned/in-progress briefs show whether they are ready or require revision.                            | template, runbook, task-briefs README, changed brief records                   | `5/5`                   |
| UX flow clarity                               | `target`     | Agents and owner can tell the next action for a brief from `audit_status` without reading the full history first.                                                        | Brief Audit Record fields and runbook status definitions                       | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this docs-only slice does not change rendered UI, layout, typography, color, screenshots, print, or brand assets.                                            | docs-only diff review                                                          | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Existing briefs are triaged conservatively; stale briefs are not marked ready without current audit evidence.                                                            | `revise-before-use` records and scope review                                   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin-related briefs receive the same audit record; no admin editor workflow or UI changes.                                                             | changed admin-related brief records                                            | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this Markdown-only slice does not change interactive semantics, focus behavior, labels, contrast, or screen-reader flow.                                     | docs-only diff review                                                          | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no route payload/CWV behavior changes; performance-related briefs are marked refresh-before-use where applicable.                                       | changed performance-related brief records                                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Audit record makes base commit, readiness state, and refresh triggers explicit before stateful implementation briefs are used.                                           | template/runbook + existing brief audit records                                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache behavior changes; future cache-sensitive briefs must refresh audit before execution.                                                           | runbook refresh triggers                                                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Old planned/in-progress briefs fail safe by requiring revision before use instead of silently carrying stale assumptions into implementation.                            | conservative triage status + runbook                                           | `5/5`                   |
| Security and authz                            | `target`     | Security/auth/payment/admin briefs require pre-use refresh; governance docs forbid secrets and provider overclaims during brief audits.                                  | runbook no-secret rules + affected brief records                               | `5/5`                   |
| Privacy and compliance                        | `target`     | Brief audit process keeps raw personal data, secrets, provider responses, and env values out of brief records.                                                           | runbook privacy rules + docs-only diff review                                  | `5/5`                   |
| Content governance                            | `target`     | Template, lifecycle docs, and existing brief records define how brief readiness is maintained over time.                                                                 | template + README + runbook + triaged records                                  | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future admin workflow briefs must refresh audit before use; no admin labels/actions/recovery paths change now.                                          | runbook + brief records                                                        | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: no crawl/metadata behavior changes; SEO briefs are marked refresh-before-use.                                                                           | SEO planned brief audit record                                                 | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: no public AI-discoverability behavior changes; AI/docs briefs are marked refresh-before-use.                                                            | AI-related planned brief audit records                                         | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics events change; analytics briefs are marked refresh-before-use or left outside scope if deferred.                                           | scope review + changed records                                                 | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: commerce/payment briefs are marked refresh-before-use; no Stripe, checkout, entitlement, or finance behavior changes.                                   | commerce-related brief records                                                 | `4/5`                   |
| Incident response and support operations      | `target`     | Brief audit runbook defines how support/ops-sensitive briefs must be refreshed before use and how stale assumptions are handled.                                         | `docs/runbooks/task-brief-audit-gate.md`                                       | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: finance-relevant briefs must refresh audit before use; this slice does not change finance reporting, payouts, invoices, refunds, or reconciliation.     | commerce/finance-related brief records + explicit scope rationale              | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: i18n-related briefs must refresh audit before use; this slice does not change locale routing, translation workflow, or multilingual content operations. | i18n-related brief records + explicit scope rationale                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Keep diff Markdown-only and reuse existing docs/brief lifecycle conventions; add no scripts, tooling, dependencies, or workflow changes.                                 | changed-files diff                                                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint and docs-only verification before PR update; no validation failures are hidden.                                                           | `npm run lint:briefs:all`, `npm run verify:pre-pr`, `npm run verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `target`     | The standard scales through a short record and runbook instead of large re-audits of every old brief body.                                                               | concise audit records + no generated inventory/tooling                         | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only rollback is a normal git revert; no release tooling changes; branch/PR follows normal docs-only gates.                                                         | docs-only diff review + verification evidence                                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no app route, component, server/client, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - no TypeScript or runtime domain contracts change.
- Supabase/data layer:
  - no migrations, RLS, indexes, generated DB types, or live data inspection.
- External services/tools:
  - no provider dashboard access, SDK/config changes, secrets, or generated inventories.
- UI system:
  - no rendered UI changes and no screenshot handoff required.
- Testing:
  - docs-only validation through brief lint and verify gates.

## Data Placement And Sync Contract

N/A for runtime state because this slice creates and updates Markdown governance docs only.

Documentation state boundaries:

- Task brief audit records are git-tracked manual documentation.
- They do not change app data, provider state, local storage, database rows, cache behavior, or generated inventories.
- Existing brief records are intentionally conservative and must be refreshed before execution.

## Identity And Rename Contract

N/A for persisted product entities because this slice does not create or mutate users, routes, slugs, database rows, notes, workouts, programs, commerce entities, or provider records.

Documentation identity:

- The Brief Audit Record field names are stable:
  - `last_audited`
  - `base`
  - `audit_status`
  - `decision`
  - `reason`
  - `must_refresh_before_execution_if`
- If field names change later, update the template, runbook, and lifecycle README together.

## Help / Guide Impact

N/A for admin Help/Guide runtime content because this slice does not change admin labels, actions, recovery behavior, or user/admin workflows.

## Route / Label / Support Surface Impact Sweep

Run a targeted sweep before PR handoff for:

- `Brief Audit Record`
- `audit_status`
- `revise-before-use`
- `task brief`
- `docs/task-brief-template.md`

Fallout should be limited to docs/runbook/task-brief lifecycle guidance. Runtime route, UI label, Help/Guide, and support behavior changes are out of scope.

## Acceptance Criteria

1. A reusable Brief Audit Record is documented in the task brief template.
2. A dedicated brief-audit runbook exists with status meanings and pre-use procedure.
3. `docs/task-briefs/README.md` explains the audit gate in the lifecycle.
4. The Phase 2A App Knowledge Book brief has a current audit record.
5. Existing `planned/` and `in-progress/` briefs have conservative audit records.
6. Existing stale briefs are not marked ready unless this slice actually audits them as ready.
7. Diff remains docs-only.
8. `npm run lint:briefs:all`, `npm run verify:pre-pr`, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

Docs-only lane is expected while the diff remains Markdown documentation under `docs/`.

## Manual QA

N/A because this slice does not change rendered UI, browser behavior, print/export output, routes, or screenshots.

Owner review should focus on whether the audit status model is understandable and conservative enough to prevent stale brief execution.

## Checkpoint Log

- `2026-05-15 | in-progress | Owner approved implementing the brief audit standard and existing-brief triage end to end; branch docs/brief-audit-gate-2026-05-15 created from main@b2a211f | next: update template, runbook, lifecycle docs, Phase 2A brief, and planned/in-progress audit records`
- `2026-05-15 | implementation | Added Brief Audit Record standard to the task brief template, task-brief lifecycle README, and new audit-gate runbook; added audit records to all 33 planned/in-progress briefs with 31 conservative revise-before-use records and 2 ready records for this active slice plus Phase 2A App Knowledge Book; route/label/support sweep stayed docs-only with no runtime, Help/Guide, route, or support behavior fallout | validation: git diff --check PASS; npm run lint:briefs:all PASS | next: commit, run npm run verify:pre-pr from branch HEAD, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-15 | pre-pr gate | npm run verify:pre-pr PASS on the docs-only lane from branch HEAD after checkpoint evidence was amended; lane confirmed all 36 changed files are docs/governance-only and ran lint:briefs:all, lint:quality-gates, lint:admin-audit, lint:env-parity, and lint:pr-body:generated successfully | next: push, open PR, monitor CI, then run npm run verify:pre-merge`
