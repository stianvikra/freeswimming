# Task Brief: AW-006 Closeout Queue And Gate Repair (10/10)

## Metadata

- `id`: `2026-05-20-aw-006-closeout-queue-gate-repair-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-20`
- `updated`: `2026-05-20`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-closeout-queue-gate-repair`

## Brief Audit Record

- `last_audited`: `2026-05-20`
- `base`: `main@ac82cbf`
- `audit_status`: `ready`
- `decision`: Execute a small AW-006 lifecycle repair before starting the next visible UI state-primitive slice.
- `reason`: `main` is clean after Admin Context QR Panel State Primitive Parity PR `#780` and repo-managed closeout PR `#781`; `npm run post-merge:preflight` reports no pending closeout, but `npm run lint:briefs` fails on clean `main` because the changed closeout brief uses `## Closeout Evidence` instead of the required `## Completion Record`. The canonical AW-006 queue and notice/empty-state inventory also still mark Admin Context QR as active/current after it moved to `done`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, task-brief closeout rules, `lint:briefs`, `verify:docs-only`, post-merge preflight, canonical queue format, notice/empty-state inventory, or verification lanes change before PR handoff.

## Goal

Repair AW-006 lifecycle state after the Admin Context QR closeout so local/CI gates catch changed done-brief closeout evidence, the canonical queue no longer points at a done in-progress path, and the next PR-sized AW-006 UI candidate is explicit.

## Pre-Implementation Owner Explanation

Dette slicen rydder prosjektkartet etter QR-arbeidet, markerer Context QR som ferdig i koe/inventory, reparerer brief-gaten som naa feiler, og peker ut neste trygge UI-slice. Det betyr noe fordi neste arbeid ellers starter fra feil kart og kan faa lokale gates til aa feile. Utenfor scope er synlig UI-endring, admin-workflow, API-er, database, Stripe, auth, screenshots og produktlogikk.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-006 queue must show Admin Context QR as done and this repair as current, with the next UI candidate recorded separately.                                                       | canonical queue diff + design inventory diff       | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor flow becomes clearer; no user-facing product flow changes.                                                                                           | queue and brief checkpoint review                  | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, visual design, layout, style, asset, screenshot, or product surface.                                                                     | visual scope review                                | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Changed docs-only verification must run strict changed-brief lint, and stale current queue rows for done briefs must be detected deterministically.                               | targeted unit tests + script diff                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, recovery action, role behavior, or operator workflow.                                                              | admin scope rationale                              | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                                           | a11y scope rationale                               | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Repair must add no runtime dependency, browser payload, route work, or app performance cost.                                                                                      | package/runtime diff review                        | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no product data, local-only state, server-canonical state, browser storage, sync, retention, cache mutation, or conflict behavior.                    | data scope rationale                               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation, stale-data policy, API cache header, or invalidation behavior changes.                                                | cache scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Clean `main` brief lint failure must be resolved, and future docs-only closeout verification must fail before merge when a changed done brief lacks required completion evidence. | `npm run lint:briefs` + docs-only script review    | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, authorization, protected route, secret, token, cookie, request input, or permission model changes.                                                           | security scope rationale                           | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data, credentials, logs, analytics payload, consent/legal copy, retention rule, or raw env value handling changes.                                        | privacy scope rationale                            | `N/A`                   |
| Content governance                            | `target`     | Done brief heading, canonical queue, and notice/empty-state inventory must be aligned so AW-006 no longer depends on stale chat or stale lifecycle state.                         | changed docs + targeted sweeps                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                             | admin workflow scope rationale                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, route content, structured public page content, or crawl-facing route changes.                                            | SEO scope rationale                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                               | AI-discoverability scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                                       | analytics scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                              | commerce scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no live incident alert path, support workflow, recovery behavior, operator diagnostic, escalation procedure, or support runbook.                                | support-ops scope rationale                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                          | finance scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing strings, locale routing, translation workflow, metadata copy, grammar-coupled UI, or locale content model.                                       | i18n scope rationale                               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing brief lint, docs-only verification, AW-006 queue, and inventory files; add no dependency or new lifecycle framework.                                               | scripts/tests/docs diff                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit coverage for stale current-row detection and run strict brief lint, targeted tests, and required broad gates before PR/merge readiness.                          | targeted Vitest + `verify:pre-pr` + CI + pre-merge | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: a small local/CI text gate prevents repeated manual closeout cleanup without adding runtime cost.                                                                | script scope review                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change must be reversible by normal git revert and must not alter deployments, migrations, secrets, package installs, or production runtime configuration.                        | git diff review + validation gates                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action, API route, cache, or rendering behavior changes.
- TypeScript/domain contracts:
  - N/A for app domain contracts.
  - Repository lifecycle invariant: changed done briefs must include required completion evidence before docs-only verification passes.
- Tooling:
  - Reuse `scripts/lint-task-brief-scorecard.mjs` for stale canonical queue detection.
  - Reuse `scripts/run-verify-docs-only.sh` for docs-only verification and add the stricter changed-brief gate.
  - Reuse existing Vitest coverage in `tests/unit/task-brief-scorecard-lint.test.ts`.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, query, storage, or schema work.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics provider, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - N/A for rendered UI; screenshot handoff is not required because this PR changes no UI/print/layout/brand/product-rendering files.
- Testing:
  - Targeted Vitest for brief lint behavior plus strict brief lint, route/label sweep, `git diff --check`, and full validation lane because scripts/tests change.

## Data Placement And Sync Contract

N/A with rationale: this lifecycle/tooling repair introduces no local-only product data, server-canonical product data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, cache invalidation, or persisted runtime metadata.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible product identifier, rename rule, alias, redirect, or migration behavior. Brief filenames remain repository lifecycle identifiers only.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow labels, support recovery behavior, Help/Guide assertions, auth, payments, or operator-facing product procedure. The affected surfaces are repo lifecycle docs and local/CI verification only.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue sweep.

- Identifiers to sweep before broad gates:
  - `Admin Context QR Panel state parity`
  - `Admin Context QR Panel state primitive parity`
  - `docs/task-briefs/in-progress/2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10.md`
  - `Completion Record`
  - `Closeout Evidence`
  - `lint:briefs`
  - `verify:docs-only`
  - `Remaining PR-Sized UX/UI Slices`
  - `notice-empty-state-pattern-inventory`
- Directories/surfaces checked:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
  - `scripts/`
  - `tests/unit/`
- Expected fallout:
  - one active repair brief,
  - canonical AW-006 queue update,
  - notice/empty-state inventory update,
  - done-brief completion heading repair,
  - strict docs-only verification gate,
  - targeted unit tests,
  - no product Help/Guide runtime update.

## Scope

- Create this in-progress child brief.
- Change the Admin Context QR closeout heading to the required `## Completion Record`.
- Update the canonical AW-006 queue after PR `#780/#781` so Admin Context QR is recorded as done and this repair slice is current.
- Record the next recommended PR-sized UI slice as Admin Notes Manager top-level state primitive parity.
- Update `docs/design/notice-empty-state-pattern-inventory.md` so Context QR is completed and Admin Notes Manager top-level parity is the next bounded candidate.
- Make `verify:docs-only` run strict changed-brief lint in addition to all-brief lint.
- Extend stale canonical queue detection to catch markdown table rows that mark a done brief's in-progress path as `current` or `active`.
- Add focused unit tests for the table-row stale queue case.

## Out Of Scope

- Runtime UI, copy, styles, layout, assets, app routes, API routes, product data, auth, checkout, analytics, Supabase, migrations, workflows, package installs, generated screenshots, CI workflow files, or merge to `main`.
- Implementing Admin Notes Manager state primitive parity in this PR.
- Broad app-wide Notice/EmptyState primitives.
- Changing task-brief lifecycle folder semantics beyond this gate repair.
- Changing Help/Guide, support procedures, Stripe, finance, reporting, i18n, or private-gate behavior.

## Acceptance Criteria

1. `npm run lint:briefs` passes on this branch and no longer fails because the latest Admin Context QR done brief lacks `## Completion Record`.
2. `verify:docs-only` runs `npm run lint:briefs` before broad all-brief lint, so future docs-only closeout PRs enforce changed done-brief completion evidence.
3. The canonical AW-006 queue and notice/empty-state inventory no longer mark Admin Context QR as active/current.
4. The canonical AW-006 queue records this repair slice as current and Admin Notes Manager top-level state primitive parity as the next UI candidate.
5. Brief lint stale canonical queue detection fails a done brief when a markdown table row lists its old in-progress path with `current` or `active` status.
6. Targeted unit tests, strict brief lint, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - `npx vitest run tests/unit/task-brief-scorecard-lint.test.ts`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Because scripts/tests change, this is not docs-only; full validation lane is required.

## Completion Record

- PR: `#782`
- Merge SHA: `main@af6e641`
- Implementation SHA: `c4b8ae7`
- Rollback: `git revert af6e641`
- `10/10 claim`: yes for the bounded AW-006 closeout queue/gate repair scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                   | Gaps / Notes                                           |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | PR `#782` updated the canonical AW-006 queue so Context QR is done, this repair shipped, and Admin Notes Manager is the next UI candidate. | No UI slice was started in this closeout repair.       |
| Business logic correctness and data integrity | `5/5`          | `verify:docs-only` now runs strict changed-brief lint, and unit coverage catches stale `current`/`active` queue rows for done briefs.      | No runtime data or product entity changed.             |
| Performance (CWV + payloads)                  | `5/5`          | PR changed docs/tooling/tests only; local full gate and CI build/perf gates passed with no runtime dependency or payload changes.          | No route-level performance behavior changed.           |
| Reliability and failure handling              | `5/5`          | Clean-main brief lint failure was fixed; future docs-only closeouts fail before merge if required done-brief evidence is missing.          | No production fallback behavior changed.               |
| Content governance                            | `5/5`          | Done heading, AW-006 queue, design inventory, active brief, PR body, local gates, and CI evidence were aligned.                            | Follow-up UI candidate remains unimplemented.          |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing brief lint, docs-only verification, queue, inventory, and Vitest surface; no dependencies or new framework added.          | No broader lifecycle framework change claimed.         |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, strict brief lint, `verify:pre-pr`, required CI, and `verify:pre-merge` passed for PR `#782`.                             | Private-gate local rerun skipped; CI site-lock passed. |
| DevOps and rollback readiness                 | `5/5`          | PR `#782` merged as `main@af6e641`; rollback is a normal git revert; no migrations, secrets, workflows, or production config changed.      | Repo-managed closeout is docs-only.                    |

## Checkpoint Log

- `2026-05-20 | in-progress | started from clean main@ac82cbf after PR #780 and repo-managed closeout PR #781; post-merge preflight found no pending closeout, but npm run lint:briefs failed on the latest done brief and AW-006 queue/inventory still marked Context QR active | next: repair completion heading, queue/inventory status, docs-only gate, stale current-row detection, and targeted tests`
- `2026-05-20 | in-progress | repaired the Admin Context QR completion heading, refreshed AW-006 queue/inventory state, added strict changed-brief lint to verify:docs-only, and extended stale current-row detection; validation passed: npm run lint:briefs:all, targeted Vitest for task-brief/merge-preflight helpers (2 files / 15 tests), npm run lint, npm run typecheck, git diff --check, and targeted route/label/support sweep | next: commit, run npm run verify:pre-pr, push, open PR, monitor CI, and run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-20 | pre-pr-gate | committed c4b8ae7 and ran npm run verify:pre-pr in full-public mode after the checkpoint amend; gate passed with lint:briefs, quality/admin/env/pr-body gates, eslint, typecheck, unit tests (204 files / 1156 tests), build, performance budgets, and Playwright E2E (98 passed / 478 skipped); evidence: artifacts/test-runs/20260520-152355/verify.log, exit-code 0 | next: push, open PR, monitor CI, and run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-20 | done | PR #782 merged as main@af6e641 after green local pre-PR, required CI, and pre-merge gates; repo-managed closeout moved this brief to done and recorded achieved target scores | next: post-merge preflight should report no pending closeout before starting the next AW-006 UI slice`
