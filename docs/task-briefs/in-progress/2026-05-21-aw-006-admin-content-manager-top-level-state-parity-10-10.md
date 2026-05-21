# Task Brief: AW-006 Admin Content Manager Top-Level State Parity (10/10)

## Metadata

- `id`: `2026-05-21-aw-006-admin-content-manager-top-level-state-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-21`
- `updated`: `2026-05-21`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-20-aw-006-post-closeout-queue-design-inventory-repair-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-content-manager-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-21`
- `base`: `main@293eb38`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded top-level state parity pass for `AdminContentManager`.
- `reason`: `main` is clean after PR `#788` and repo-managed closeout PR `#789`; `npm run post-merge:preflight` reports no pending closeout. A short canonical queue/design/code re-audit found no selected AW-006 UI slice, while `AdminContentManager` still renders top-level loading, load error+retry, schema warning, course structure warning, action feedback, empty, and no-results states with route-local markup after sibling admin surfaces already adopted `AdminManagerState`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContentManager`, `AdminManagerState`, admin content Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring `AdminContentManager` top-level feedback and list states into parity with the existing admin-local state primitive without changing admin content data, authz, API behavior, content workflows, copy, revisions, Context Notes, Context QR, or support procedures.

## Pre-Implementation Owner Explanation

Vi rydder toppnivaa-statusene i adminens innholdsmanager: lasting, lastefeil med retry, varsel, handlingsfeedback, tom liste og ingen treff skal bruke samme admin-state-moenster som QR, Notes og Context Notes allerede bruker. Det betyr noe fordi admin blir mer konsekvent og lettere aa lese naar innhold laster, feiler eller mangler. Utenfor scope er innholdsendringer, publisering, sletting, rollback, revisjoner, Context Notes/QR, API, database, auth, Stripe, analytics og bred design-system-refaktor.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                     | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` top-level state rendering and keep the AW-006 canonical queue accurate after `#788/#789`.                                             | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Loading, load error+retry, schema warning, course structure warning, action feedback, empty list, and no-results states remain visible, specific, and recoverable where needed.        | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated states use the existing `AdminManagerState` visual contract and match the admin manager family without broad redesign or unrelated card/layout changes.                       | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Content fetches, category fetches, retry callbacks, create/update/delete payloads, course structure actions, filters, sort, revisions, Context Notes, and Context QR remain unchanged. | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still see clear refresh/retry/action feedback and empty guidance while managing content items.                                                                                  | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback uses polite status semantics, recoverable load errors remain announced, and static empty/no-results states are not noisy live regions.                 | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                        | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                          | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                          | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load errors keep retry wired to the same loader; empty/no-results states remain deterministic from existing arrays and filters; action feedback remains visible.           | component tests for retry, empty/no-results, and action feedback   | `5/5`                   |
| Security and authz                            | `target`     | Protected admin content API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                  | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                    | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin content copy, status model, revision history, rollback path, and AW-006 docs source of truth are preserved or explicitly updated for this slice only.                   | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Create, edit, status, delete, course structure, revision, Context Notes, and Context QR actions keep existing labels, disabled states, and recovery behavior.                          | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                      | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                    | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin content actions continue to use current fetch/mutation behavior.                                       | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin content state rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.           | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                          | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                               | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                       | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, existing Tailwind/admin classes, and no new dependency or app-wide primitive.                                | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for migrated content manager top-level states; run targeted tests, brief lint, screenshot handoff, and required broad gates after screenshot approval.  | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                                | helper reuse across one bounded content manager surface            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                              | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially `AdminQrLinksManager`, `AdminNotesManager`, `AdminContextQrPanel`, and `AdminContextNotesPanel`.
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminContentManager.tsx`; do not move fetches, mutations, route boundaries, editor placement, or server/client ownership.
  - Route/action/API boundary: `/api/admin/content`, `/api/admin/content/[id]`, `/api/admin/content/[id]/revisions`, `/api/admin/content/course-structure`, category fetches, Context Notes/QR endpoints, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current response types, form state, edit state, content row type, mutation payloads, content type/status filters, revision state, context refs, and fallback error strings.
  - Deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty derives from `items.length`, no-results derives from existing filters, and action feedback derives from existing mutation outcomes.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and AW-006 state-color direction.
  - Keep the primitive admin-local; this is one bounded admin content parity pass, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Content Manager states to already-migrated admin reference states where practical.
- Testing:
  - Add focused unit/component tests for Content Manager loading, schema warning, load error+retry, action feedback, empty state, and no-results state.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin content rows, categories, revisions, course structure, Context Notes, and QR links remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing content IDs, slugs, titles, statuses, parent IDs, revision IDs, context refs, note IDs, and QR IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading content list`
  - `Could not load content list`
  - `Content catalog will appear`
  - `No content items created yet`
  - `No content items match`
  - `Course structure integrity warning`
  - `actionError`
  - `actionNotice`
  - `role="status"`
  - `role="alert"`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminContentManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-content-manager-state.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-content-parity.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Content Manager top-level states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminContentManager.tsx` to `AdminManagerState`:
  - schema warning,
  - content list loading,
  - content list load error + retry,
  - course structure integrity warning,
  - action error where currently rendered in the create form,
  - action notice,
  - empty content list state,
  - no-results state.
- Add focused unit/component tests under `tests/unit/admin-content-manager-state.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API unless a tiny compatibility adjustment is required by Content Manager.
- Admin content API changes.
- Admin content copy or workflow label changes.
- Content create/update/delete/status/course-structure/revision logic changes.
- Context Notes or Context QR behavior changes.
- Admin content editor layout redesign.
- Admin notes upload/recovery behavior.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note/QR API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminContentManager` uses the existing `AdminManagerState` helper for the scoped top-level feedback/list-state renderings while preserving copy, callbacks, fetches, mutations, filters, sort, course structure behavior, revisions, Context Notes, and Context QR.
2. Accessibility semantics are explicit: dynamic status/action feedback uses polite status semantics, recoverable errors remain announced, and static empty/no-results states are not live regions.
3. Focused tests cover loading, warning, load error+retry, action feedback, empty content, and no-results behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Content Manager states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx`: PASS, 2 files / 9 tests.
  - `npm run lint:briefs`: PASS, no tracked changed briefs found before staging; `npm run lint:briefs:all` was run to validate the new untracked active brief.
  - `npm run lint:briefs:all`: PASS, all 333 brief files including this active brief.
  - targeted route/label/support sweep listed above: PASS, no Help/Guide or runbook update needed because labels and recovery behavior are unchanged.
  - `git diff --check`: PASS.
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before PR gates
  - Captured artifact folder: `output/aw-006-admin-content-state-20260521-060822`
  - Captured: `2026-05-21 06:08`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-admin-content-empty-desktop.png`
    - `after-admin-content-load-error-desktop.png`
    - `after-admin-content-warning-mobile.png`
    - `reference-admin-notes-empty-desktop.png`
  - Known visual caveat: screenshots use a temporary local development route rendering the production components with mocked browser API responses; the temporary route and capture script were removed before handoff. The local Next dev indicator appears in the lower-left corner of screenshots, but no red error overlay remains in the final capture set.
  - No committed product-rendering file changed after the final capture.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`: PASS (`artifacts/test-runs/20260521-061921/verify.log`; full lane: lint, typecheck, 206 unit files / 1171 tests, build, perf budgets, Playwright 98 passed / 478 skipped).
  - required CI
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-21 | in-progress | started from clean main@293eb38 after PR #788 and repo-managed closeout PR #789; post-merge preflight found no pending closeout; short queue/design/code re-audit selected Admin Content Manager top-level state parity as the next bounded AW-006 UI slice | next: update queue/inventory, migrate top-level state rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-21 | screenshot-review | migrated scoped AdminContentManager top-level states to AdminManagerState, added focused unit coverage, updated AW-006 queue and design inventory, passed targeted tests/lint/sweep/diff-check, and captured final screenshot artifacts at output/aw-006-admin-content-state-20260521-060822 after removing the temporary capture route/script | next: wait for owner screenshot approval before running npm run verify:pre-pr`
- `2026-05-21 | screenshot-approved | owner approved screenshot handoff for output/aw-006-admin-content-state-20260521-060822; no committed product-rendering file changed after the final capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-21 | pre-pr-verified | npm run verify:pre-pr passed after clearing stale generated Next dev cache from the removed temporary capture route; evidence log artifacts/test-runs/20260521-061921/verify.log | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
