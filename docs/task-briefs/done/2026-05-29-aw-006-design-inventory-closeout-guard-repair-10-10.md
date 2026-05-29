# Task Brief: AW-006 Design Inventory Closeout Guard Repair (10/10)

## Metadata

- `id`: `2026-05-29-aw-006-design-inventory-closeout-guard-repair-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-29`
- `updated`: `2026-05-29`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-design-inventory-closeout-guard-repair`

## Brief Audit Record

- `last_audited`: `2026-05-29`
- `base`: `main@adbca6d`
- `audit_status`: `ready`
- `decision`: Execute a bounded docs/tooling slice before selecting the next AW-006 UI implementation slice.
- `reason`: `main` is clean and synced after PR `#900` and repo-managed closeout PR `#901`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found the canonical AW-006 queue correctly says no active slice, but `docs/design/notice-empty-state-pattern-inventory.md` still lists the completed Admin Content Manager Utility State Parity brief as `Active:`. Existing brief lint passes because table cells like `Active: <path>` are not treated as stale active/current/candidate lifecycle cells.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `post-merge:preflight`, `lint:briefs`, AW-006 queue format, design inventory format, task-brief metadata keys, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Clean the stale AW-006 design-inventory active reference and harden closeout-reference detection so a completed slice cannot remain listed as `Active: <in-progress path>` inside queue or inventory table cells.

## Pre-Implementation Owner Explanation

Vi rydder en feil i prosjektkartet som sier at en ferdig admin-jobb fortsatt er aktiv, og strammer kontrollen som skulle fanget dette automatisk. Det betyr at neste AW-006-jobb starter fra riktig køstatus. Utenfor scope er UI, app-logikk, adminflyt, API-er, auth, database, betaling og screenshots.

Fremoverkompatibilitet: fremtidige closeouts skal automatisk feile hvis kø/designinventar sier `Active: ...` for en ferdig slice, også når teksten ligger inne i en tabellcelle.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                              | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The AW-006 canonical queue and design inventory must agree that no active implementation slice is selected after `#900/#901`.                                   | docs diff + route/label/support sweep                           | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: cleaner lifecycle output reduces operator confusion, but this slice changes no user/admin product flow.                                        | lint/preflight message review                                   | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no rendered UI, CSS, visual tokens, screenshots, layout, print, or brand assets.                                                 | visual scope rationale                                          | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Stale-reference detection must catch a done brief when a reference table cell contains `Active: docs/task-briefs/in-progress/<same-file>`.                      | targeted unit tests                                             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: accurate AW-006 lifecycle state helps admin-polish planning, but no admin editor UI, workflow, or action changes.                              | docs diff                                                       | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no semantic markup, focus handling, live region, label, contrast, keyboard flow, or user-facing UI changes.                                         | a11y scope rationale                                            | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, dependency, build output, cache, or browser payload changes.                                                              | performance scope rationale                                     | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this tooling/docs slice introduces no local state, server-canonical state, browser storage, sync, conflict, or invalidation behavior.               | data contract section                                           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, cache mode, revalidation, route handler, or stale-data behavior changes.                                                             | cache scope rationale                                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Brief lint and post-merge preflight helper logic must surface this stale lifecycle state deterministically without relying on manual re-audit memory.           | targeted unit tests + post-merge smoke                          | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, input surface, secret, cookie, role, token, or external credential behavior changes.                               | security scope rationale                                        | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payload, consent/legal copy, retention rule, or raw env value handling changes.                                       | privacy scope rationale                                         | `N/A`                   |
| Content governance                            | `target`     | The design inventory must stop naming completed Admin Content Manager work as active, and the guard must cover the table-cell pattern that let it pass.         | docs diff + brief lint                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, workflow labels, recovery behavior, Help/Guide procedure, or operator action changes.                                                | admin workflow scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content changes.                                        | SEO scope rationale                                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe content, or AI-facing documentation contract changes.                                | AI-discoverability scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, persistence, dashboard metric, logging payload, or KPI threshold changes.                                                        | analytics scope rationale                                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, pricing, invoice, refund, payout, or revenue data changes.                                               | commerce scope rationale                                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no alert path, incident runbook, support queue, operator recovery procedure, or support diagnostics.                                          | explicit support-ops scope rationale                            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.        | explicit finance scope rationale                                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata text, or grammar-coupled UI copy.                              | explicit i18n scope rationale                                   | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing task-brief lint and post-merge preflight helper path, add no dependency, and keep parsing changes narrow to lifecycle-reference detection.   | script diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit coverage for `Active: <path>` table-cell references and keep historical checkpoint-log references allowed; run targeted tests and repo gates. | targeted Vitest + `lint:briefs` + `verify:pre-pr` + CI evidence | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the guard reduces repeated manual lifecycle repair cost without adding runtime services, dependencies, or recurring infrastructure.            | automation behavior + no package diff                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, env/config, workflow, package, or runtime deploy-setting changes are allowed.               | git diff review + validation gates                              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- Tooling:
  - Reuse `scripts/lint-task-brief-scorecard.mjs` as the canonical changed-brief lint surface.
  - Reuse `scripts/post-merge-preflight.mjs` for post-merge closeout diagnostics through shared helper behavior.
  - Do not create a parallel checker that operators must remember separately.
- TypeScript/runtime:
  - N/A for runtime app code; this is Node script logic only.
  - Keep detection deterministic, path-normalized, and scoped to reference docs declared by done-brief metadata.
- Docs/reference surfaces:
  - Reference docs come from done-brief metadata:
    - `canonical_queue`
    - `design_inventory`
  - Historical checkpoint logs may mention old active work and must not fail the guard.
- Tests:
  - Extend existing unit tests for task-brief lint and post-merge preflight.
  - Keep tests fixture-based and independent of current repo docs where practical.

## Data Placement And Sync Contract

N/A with rationale: this tooling/docs slice introduces no local-only data, server-canonical data, browser storage, sync behavior, conflict policy, cache invalidation, retention rule, or sensitive-data handling.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, user-facing title identity, analytics identity, operator-visible domain identifier, rename rule, alias, redirect, or migration behavior. Task-brief filenames and metadata IDs remain the existing stable references.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 canonical queue rows, design-inventory rows, and future done briefs with `canonical_queue`/`design_inventory` metadata.
- Source of truth:
  - A done brief's filename and title candidates remain the source for stale lifecycle-reference detection.
- Additive behavior:
  - Future queue/inventory table cells that include `Active:`, `Current:`, `Candidate:`, or `In progress:` plus the stale done-brief path/title should be caught by lint/preflight helper logic.
- Explicit mapping requirements:
  - A new lifecycle keyword outside active/current/candidate/in-progress requires an explicit parser/test update.
- Unknown or deprecated values:
  - Historical checkpoint-log references remain ignored so old logs do not block closeout.
- Test/evidence:
  - Targeted fixture tests prove the current `Active: <path>` table-cell form fails before cleanup and passes after cleanup.

## Help / Guide Impact

N/A with rationale: this slice changes governance tooling and AW-006 planning docs only. It changes no admin/user workflow labels, support recovery behavior, Help/Guide content contract, runbook procedure, or operator UI action.

## Route / Label / Support Surface Sweep

Required as a targeted docs/tooling sweep because this slice changes lifecycle-reference behavior.

- Identifiers to search before broad gates:
  - `canonical_queue`
  - `design_inventory`
  - `Active:`
  - `active/current/candidate`
  - `Admin Content Manager Utility State Parity`
  - `post-merge:preflight`
  - `lint:briefs`
- Surfaces to check:
  - `scripts/lint-task-brief-scorecard.mjs`
  - `scripts/post-merge-preflight.mjs`
  - `tests/unit/task-brief-scorecard-lint.test.ts`
  - `tests/unit/merge-preflight.test.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - design inventory stale active row corrected,
  - focused parser tests,
  - active brief checkpoint updates,
  - no Help/Guide, runbook, runtime UI, or support-procedure update.

## Scope

- Harden stale closeout-reference detection in `scripts/lint-task-brief-scorecard.mjs`.
- Preserve `scripts/post-merge-preflight.mjs` behavior through the shared exported helper.
- Extend targeted tests in:
  - `tests/unit/task-brief-scorecard-lint.test.ts`
  - `tests/unit/merge-preflight.test.ts`
- Update stale AW-006 references in:
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md` if the sweep finds stale planned-queue wording.
- Update this active brief with validation evidence.

## Out Of Scope

- Selecting or implementing the next AW-006 UI slice.
- Runtime UI, CSS, screenshot artifacts, browser flows, API behavior, Supabase, auth, Stripe, analytics, workflow labels, Help/Guide, or runbook procedure changes.
- Broad task-brief parser refactors beyond the stale-reference guard needed here.

## Acceptance Criteria

1. Changed done-brief lint fails a stale design-inventory table cell that contains `Active: docs/task-briefs/in-progress/<same-file>`.
2. Post-merge preflight's shared stale-reference detection reports the same pattern for changed done briefs.
3. Historical checkpoint-log references remain allowed.
4. The AW-006 design inventory no longer lists Admin Content Manager Utility State Parity as active after cleanup.
5. Targeted tests, `npm run lint:briefs`, `npm run lint:briefs:all`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation Plan

- `./node_modules/.bin/vitest run tests/unit/task-brief-scorecard-lint.test.ts tests/unit/merge-preflight.test.ts`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- targeted route/label/support sweep listed above
- `git diff --check`
- `npm run post-merge:preflight`
- `npm run verify:pre-pr`
- Required GitHub checks on the PR
- `npm run verify:pre-merge`

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/task-brief-scorecard-lint.test.ts tests/unit/merge-preflight.test.ts` -> PASS, 2 files / 25 tests.
  - Initial `npm run lint:briefs:all` after the first parser change exposed false positives from normal table notes containing words like `current`; the parser was tightened to exact status cells or cells starting with `Active:`, `Current:`, `Candidate:`, or `In progress:`.
  - `npm run lint:briefs:all` -> PASS, 388 brief files.
  - `git diff --check` -> PASS.
  - targeted route/label/support sweep listed above -> PASS; fallout is limited to the active brief, the design inventory, task-brief lint helper, and focused unit tests.
  - `npm run post-merge:preflight` on the feature branch -> expected branch warning only; no pending closeout is detected from the current commit snapshot.
- Pre-PR gate:
  - `npm run verify:pre-pr` -> PASS, full-public lane, artifact log `artifacts/test-runs/20260529-210910/verify.log`, exit code `0`.
  - Included `lint:briefs`, `lint:quality-gates`, `lint:admin-audit`, `lint:env-parity`, `lint:pr-body:generated`, `lint`, `typecheck`, `test:unit` (220 files / 1289 tests), `build`, `test:perf:budgets`, and `test:e2e` (102 passed / 492 skipped).

## Checkpoint Log

- `2026-05-29 | in-progress | started from clean main@adbca6d after PR #900 and closeout PR #901; post-merge preflight passed with no pending closeout; owner approved the AW-006 Design Inventory Closeout Guard Repair slice after fresh queue/design/code re-audit found a stale design-inventory Active reference and a guard hole for table cells containing Active: <path> | next: implement scoped guard/test/docs repair and run targeted validation before broad gates`
- `2026-05-29 | targeted validation | implemented scoped parser/test/docs repair, fixed one over-broad table-cell detection attempt, corrected the stale design-inventory Active reference, and passed targeted Vitest, lint:briefs:all, route/label/support sweep, git diff --check, and feature-branch post-merge preflight smoke | next: stage changes, run npm run lint:briefs and npm run verify:pre-pr before commit/push/PR`
- `2026-05-29 | pre-PR validation | npm run verify:pre-pr passed full-public lane with artifact log artifacts/test-runs/20260529-210910/verify.log; no screenshot handoff required because the slice changes docs/tooling/tests only | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-29 | merged | PR #902 merged to main as bc77599; post-merge preflight surfaced this repo-managed docs-only closeout | next: validate, merge closeout PR, sync main, rerun post-merge preflight, and reassess chat handoff`

## Completion Record

- `completed`: `2026-05-29`
- `merged_pr`: `#902`
- `squash_commit`: `bc77599`
- `result`: Closed AW-006 Design Inventory Closeout Guard Repair. The stale AW-006 design-inventory active reference now points to the completed brief, and the closeout guard catches future `Active: <in-progress path>` table-cell references before they can survive closeout.
- `validation`: Targeted Vitest passed for task-brief lint and merge preflight tests; `npm run lint:briefs:all` passed; `npm run verify:pre-pr` passed full-public lane; PR #902 CI passed including `verify`, `e2e-smoke`, `deploy-preview`, `size-check`, CodeQL, and Vercel; `npm run verify:pre-merge` passed full lane with marker `artifacts/verify-pre-merge/20260529-193024.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                    | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Design inventory now records Admin Content Manager Utility State Parity as done, while the canonical AW-006 queue remains without an active selected slice. | No gap.      |
| Business logic correctness and data integrity | `5/5`          | Added fixture coverage proving stale `Active: docs/task-briefs/in-progress/...` table-cell references fail for done briefs.                                 | No gap.      |
| Reliability and failure handling              | `5/5`          | Shared closeout-reference helper behavior is covered through post-merge preflight regression tests.                                                         | No gap.      |
| Content governance                            | `5/5`          | Corrected stale lifecycle wording and completed repo-managed closeout evidence after merge.                                                                 | No gap.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing lint/preflight surfaces; no dependencies, config, runtime, API, DB, or workflow changes.                                                    | No gap.      |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `lint:briefs:all`, `verify:pre-pr`, PR #902 CI, and `verify:pre-merge` all passed.                                                         | No gap.      |
| DevOps and rollback readiness                 | `5/5`          | PR #902 merged cleanly as a single squash commit; rollback is normal git revert, with no migrations or deploy-setting changes.                              | No gap.      |
