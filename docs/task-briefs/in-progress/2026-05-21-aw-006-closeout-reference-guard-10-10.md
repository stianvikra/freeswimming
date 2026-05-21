# Task Brief: AW-006 Closeout Reference Guard (10/10)

## Metadata

- `id`: `2026-05-21-aw-006-closeout-reference-guard-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-21`
- `updated`: `2026-05-21`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-top-level-state-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-closeout-reference-guard`

## Brief Audit Record

- `last_audited`: `2026-05-21`
- `base`: `main@0a9aa7d`
- `audit_status`: `ready`
- `decision`: Execute a bounded tooling/governance slice before selecting the next AW-006 UI slice.
- `reason`: After PR `#790` and repo-managed closeout PR `#791`, `main` was clean and `npm run post-merge:preflight` reported no required closeout. A short re-audit still found stale `active` Admin Content Manager references in the canonical AW-006 queue and design inventory. The existing guard only detected stale old `in-progress` paths, not stale active/current/candidate title references.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `post-merge:preflight`, `lint:briefs`, AW-006 queue format, design inventory format, task-brief metadata keys, or verification lanes change before PR handoff.

## Goal

Systematize AW-006 closeout reference checks so completed child briefs cannot leave stale active/current/candidate references in the canonical queue or design inventory, then clean up the current stale Admin Content Manager references.

## Pre-Implementation Owner Explanation

Vi gjoer rydderunden automatisk: naar en AW-006-slice flyttes til `done`, skal verktøyet oppdage om koeen eller design-inventory fortsatt kaller den aktiv, gjeldende eller kandidat. Det betyr noe fordi neste arbeid ikke skal starte fra en gammel peker. Utenfor scope er ny UI, produktlogikk, API, database, auth, Stripe, analytics og valg av neste faktiske UI-slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Content governance`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                  | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The AW-006 queue must no longer show completed Admin Content Manager work as the active UI slice, and this guard must be the only current bounded work before next-slice selection. | queue diff + changed-files review                               | `5/5`                   |
| UX flow clarity                               | `target`     | Post-merge output and brief-lint failures must name the stale reference doc and stale text so the next operator has one clear repair target.                                        | targeted tests + command output                                 | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no rendered UI, CSS, visual tokens, screenshots, layout, print, or brand assets.                                                                     | visual scope rationale                                          | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Detection must catch stale active/current/candidate references by old `in-progress` path and by completed slice title in canonical queue and design inventory.                      | targeted unit tests                                             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: cleaner AW-006 lifecycle state reduces admin-polish planning confusion, but no admin editor workflow or UI behavior changes.                                       | queue/inventory diff                                            | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no semantic markup, focus handling, live region, label, contrast, keyboard flow, or user-facing UI changes.                                                             | a11y scope rationale                                            | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, dependency, build output, cache, or browser payload changes.                                                                                  | performance scope rationale                                     | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this tooling/docs slice introduces no local state, server-canonical state, browser storage, sync, conflict, or invalidation behavior.                                   | data contract section                                           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, cache mode, revalidation, route handler, or stale-data behavior changes.                                                                                 | cache scope rationale                                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Post-merge and changed-brief lint must fail/surface stale reference state deterministically without relying on manual re-audit memory.                                              | targeted unit tests + post-merge smoke                          | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, input surface, secret, cookie, role, token, or external credential behavior changes.                                                   | security scope rationale                                        | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payload, consent/legal copy, retention rule, or raw env value handling changes.                                                           | privacy scope rationale                                         | `N/A`                   |
| Content governance                            | `target`     | The canonical AW-006 queue and design inventory must stop naming completed Admin Content Manager work as active/current/candidate before the next UI slice is selected.             | docs diff + brief lint                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, workflow labels, recovery behavior, Help/Guide procedure, or operator action changes.                                                                    | admin workflow scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content changes.                                                            | SEO scope rationale                                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe content, or AI-facing documentation contract changes.                                                    | AI-discoverability scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, persistence, dashboard metric, logging payload, or KPI threshold changes.                                                                            | analytics scope rationale                                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, pricing, invoice, refund, payout, or revenue data changes.                                                                   | commerce scope rationale                                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no alert path, incident runbook, support queue, operator recovery procedure, or support diagnostics.                                                              | explicit support-ops scope rationale                            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                            | explicit finance scope rationale                                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata text, or grammar-coupled UI copy.                                                  | explicit i18n scope rationale                                   | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing task-brief lint and post-merge preflight scripts, add no dependency, and keep the guard scoped to task-brief metadata reference docs.                            | script diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit coverage for stale old-path, title-only, design-inventory, and checkpoint-log-safe cases; run targeted tests and required repo gates.                             | targeted Vitest + `lint:briefs` + `verify:pre-pr` + CI evidence | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the guard reduces repeated manual lifecycle repair cost without adding runtime services or recurring infrastructure.                                               | automation behavior + no package diff                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, env/config, workflow, package, or runtime deploy-setting changes are allowed.                                   | git diff review + validation gates                              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Tooling:
  - Reuse `scripts/lint-task-brief-scorecard.mjs` as the canonical changed-brief lint surface.
  - Reuse `scripts/post-merge-preflight.mjs` for post-merge closeout diagnostics.
  - Do not create a parallel checker that operators must remember separately.
- TypeScript/runtime:
  - N/A for runtime app code; this is Node script logic only.
  - Keep detection deterministic and path-normalized.
- Docs/reference surfaces:
  - Reference docs come from done-brief metadata:
    - `canonical_queue`
    - `design_inventory`
  - Historical checkpoint logs may mention old active work and must not fail the guard.
- Tests:
  - Extend existing unit tests for task-brief lint and post-merge preflight.
  - Keep the tests fixture-based and independent of current repo docs where practical.

## Data Placement And Sync Contract

N/A with rationale: this tooling/docs slice introduces no local-only data, server-canonical data, browser storage, sync behavior, conflict policy, cache invalidation, retention rule, or sensitive-data handling.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, user-facing title identity, analytics identity, operator-visible domain identifier, rename rule, alias, redirect, or migration behavior. Task-brief filenames and metadata IDs remain the existing stable references.

## Help / Guide Impact

N/A with rationale: this slice changes governance tooling and AW-006 planning docs only. It changes no admin/user workflow labels, support recovery behavior, Help/Guide content contract, runbook procedure, or operator UI action.

## Route / Label / Support Surface Sweep

Required as a targeted docs/tooling sweep because this slice changes lifecycle-reference behavior.

- Terms swept before broad gates:
  - `canonical_queue`
  - `design_inventory`
  - `Active brief`
  - `active/current/candidate`
  - `Admin Content Manager top-level state parity`
  - `post-merge:preflight`
  - `lint:briefs`

## Implementation Scope

- Extend stale closeout-reference detection in:
  - `scripts/lint-task-brief-scorecard.mjs`
  - `scripts/post-merge-preflight.mjs`
- Extend targeted tests in:
  - `tests/unit/task-brief-scorecard-lint.test.ts`
  - `tests/unit/merge-preflight.test.ts`
- Update stale AW-006 references in:
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`

## Out Of Scope

- Selecting or implementing the next AW-006 UI slice.
- Runtime UI, CSS, screenshot artifacts, browser flows, API behavior, Supabase, auth, Stripe, analytics, workflow labels, Help/Guide, or runbook procedure changes.
- Broad task-brief parser refactors beyond the stale-reference guard needed here.

## Acceptance Criteria

1. `post-merge:preflight` detects the current stale Admin Content Manager active/current/candidate references before docs cleanup.
2. Changed done-brief lint can fail stale references by old `in-progress` path and by completed slice title.
3. Detection covers both `canonical_queue` and `design_inventory` metadata paths.
4. Historical checkpoint-log references remain allowed.
5. The AW-006 queue and design inventory no longer list Admin Content Manager as active/current/candidate after cleanup.
6. Targeted unit tests, `npm run lint:briefs`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge recommendation.

## Validation Plan

- `npx vitest run tests/unit/task-brief-scorecard-lint.test.ts tests/unit/merge-preflight.test.ts`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run post-merge:preflight`
- `npm run verify:pre-pr`
- Required GitHub checks on the PR
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-21 | in-progress | started from clean main@0a9aa7d after PR #790 and repo-managed closeout PR #791; initial targeted tests proved the enhanced guard detects current stale queue/design-inventory references by title | next: finish docs cleanup, run targeted validation, and open PR`
- `2026-05-21 | in-progress | implemented metadata-driven stale reference detection for canonical queue and design inventory, cleaned the stale Admin Content Manager queue/inventory state, and tightened detection to avoid done-table and checkpoint-log false positives; targeted Vitest, npm run lint:briefs:all, git diff --check, and post-merge preflight smoke passed | next: run npm run verify:pre-pr before commit/push/PR handoff`
- `2026-05-21 | pre-pr validation | npm run verify:pre-pr passed in full lane with artifact log artifacts/test-runs/20260521-100355/verify.log; full unit, build, perf budgets, and Playwright E2E passed | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
