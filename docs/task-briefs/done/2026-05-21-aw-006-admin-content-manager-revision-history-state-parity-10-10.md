# Task Brief: AW-006 Admin Content Manager Revision-History State Parity (10/10)

## Metadata

- `id`: `2026-05-21-aw-006-admin-content-manager-revision-history-state-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-21`
- `updated`: `2026-05-21`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-21-aw-006-closeout-reference-guard-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-content-revision-history-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-21`
- `base`: `main@7e5df65`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded revision-history state parity pass for `AdminContentManager`.
- `reason`: `main` is clean after PR `#792` and repo-managed closeout PR `#793`; post-merge preflight is green with no pending closeout. A fresh queue/design/code re-audit found that `AdminEmailTemplatesManager` already renders revision-history loading, error+retry, and empty states through `AdminManagerState`, while `AdminContentManager` still uses route-local paragraph markup for the same revision-history state slots.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContentManager`, `AdminEmailTemplatesManager`, `AdminManagerState`, admin content Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring `AdminContentManager` revision-history feedback states into parity with the existing admin-local state primitive without changing admin content APIs, restore/copy/workflow behavior, revision data, labels, or support procedures.

## Pre-Implementation Owner Explanation

Vi rydder revisjonshistorikken i adminens innholdsmanager slik at lasting, feil med retry og tom historikk vises med samme robuste admin-state-moenster som e-postmaler allerede bruker. Det betyr noe fordi rollback/revisjonsflyten blir mer konsekvent og lettere aa lese uten at selve restore-, copy- eller publiseringslogikken endres. Utenfor scope er nye API-er, databaseendringer, endret innholdsmodell, bred redesign, nye workflow-labels og endringer i Help/Guide eller supportprosedyrer.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                      | Evidence                                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` revision-history state rendering and keep the AW-006 canonical queue accurate after `#792/#793`.                                       | active brief + canonical queue diff + changed-files review            | `5/5`                   |
| UX flow clarity                               | `target`     | Revision-history loading, recoverable load error+retry, and empty-history states remain visible, specific, and recoverable where applicable.                                            | component diff + targeted tests + screenshot handoff                  | `5/5`                   |
| Visual design quality                         | `target`     | Migrated revision-history states use the existing `AdminManagerState` visual contract and match the Email templates revision-history reference without broad redesign.                  | screenshot handoff + DOM/class review                                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Content revision fetches, restore mutation payloads, disabled restore rules, copy/preview/workflow actions, status actions, Context Notes, and Context QR behavior remain unchanged.    | targeted component tests + diff review                                | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still get clear revision-history refresh/retry/empty feedback while deciding whether to restore an item revision.                                                                | component tests + screenshot handoff                                  | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Revision-history loading uses polite status semantics, recoverable revision errors remain announced, and static empty-history state is not a noisy live region.                         | component tests for roles/aria + screenshot/manual review             | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                         | package diff + build/pre-pr gate                                      | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                           | data contract section                                                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                           | cache scope rationale                                                 | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable revision-history errors keep retry wired to the same loader; loading and empty states remain deterministic from existing per-item revision maps.                            | component tests for retry, loading, and empty-history states          | `5/5`                   |
| Security and authz                            | `target`     | Protected admin content API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                   | unchanged API-route diff review + targeted component tests            | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                     | privacy scope rationale                                               | `N/A`                   |
| Content governance                            | `target`     | Existing admin content copy, status model, revision history, rollback path, and AW-006 docs source of truth are preserved or explicitly updated for this slice only.                    | copy-preservation diff review + docs update                           | `5/5`                   |
| Admin workflow and editability                | `target`     | Revision open/refresh, restore, status, delete, copy, preview, edit, Context Notes, and Context QR actions keep existing labels, disabled states, and recovery behavior.                | targeted tests + screenshot handoff                                   | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                       | SEO scope rationale                                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                     | AI-discoverability scope rationale                                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin content revision actions continue to use current fetch/mutation behavior.                               | diff review                                                           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin content revision-history rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data. | explicit commerce scope rationale                                     | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                           | explicit support-ops scope rationale                                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                | explicit finance scope rationale                                      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                        | copy-preservation diff review                                         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, model the mature `AdminEmailTemplatesManager` revision-history surface, and add no dependency.                | component diff + package diff                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for Content Manager revision-history states; run targeted tests, brief lint, screenshot handoff, and required broad gates after screenshot approval.     | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge`    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                                 | helper reuse across one bounded content manager revision-history area | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                               | git diff review + validation gates                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `AdminEmailTemplatesManager` revision-history panel in `components/admin/AdminEmailTemplatesManager.tsx`.
  - Reuse `components/admin/AdminManagerState.tsx` in the `AdminContentManager` revision-history panel; do not move fetches, mutations, route boundaries, editor placement, or server/client ownership.
  - Route/action/API boundary: `/api/admin/content`, `/api/admin/content/[id]`, `/api/admin/content/[id]/revisions`, category fetches, Context Notes/QR endpoints, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current content row type, revision row type, per-item revision maps, restore mutation payloads, fallback error strings, status filters, and disabled action rules.
  - Deterministic invariants: revision loading renders only for the active loading item, error renders only for the affected item, retry invokes the same revision loader, and empty derives from the existing per-item revision array.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and the mature Email templates revision-history state slots.
  - Keep the primitive admin-local; this is one bounded admin content revision-history parity pass, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Content Manager revision states to the Email templates revision-history reference where practical.
- Testing:
  - Add focused unit/component tests for revision-history loading, error+retry, empty history, and restore-action preservation where practical.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin content rows, revisions, categories, course structure, Context Notes, and QR links remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing content IDs, slugs, titles, statuses, parent IDs, revision IDs, context refs, note IDs, and QR IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, revision copy, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing revision-history state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading revisions`
  - `No revisions yet`
  - `Could not load revision history`
  - `Revision history`
  - `Refresh history`
  - `Restore`
  - `Copy`
  - `Preview`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminContentManager.tsx`
  - `components/admin/AdminEmailTemplatesManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-content-manager-state.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-content-parity.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Content Manager revision-history states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminContentManager.tsx` revision-history panel to `AdminManagerState`:
  - revision-history loading,
  - revision-history load error + retry if currently hidden behind global action error behavior,
  - empty revision-history list.
- Preserve existing revision list markup, restore button behavior, disabled states, copy, status actions, delete, edit, preview, copy, Context Notes, Context QR, and content APIs.
- Add focused unit/component tests under `tests/unit/admin-content-manager-state.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API unless a tiny compatibility adjustment is required by Content Manager revision-history states.
- Admin content API changes.
- Admin content copy or workflow label changes.
- Content create/update/delete/status/course-structure/revision restore behavior changes.
- Context Notes or Context QR behavior changes.
- Admin content editor layout redesign.
- Admin notes upload/recovery behavior.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note/QR API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminContentManager` uses the existing `AdminManagerState` helper for revision-history loading, error+retry, and empty-history states while preserving copy, callbacks, fetches, restore payloads, disabled states, and sibling content workflows.
2. Accessibility semantics are explicit: revision loading uses polite status semantics, recoverable revision-history errors are announced, and static empty revision history is not a live region.
3. Focused tests cover revision-history loading, recoverable error+retry, empty history, and unchanged restore-button behavior where a revision exists.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Content Manager revision states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx`: PASS, 2 files / 12 tests.
  - `npm run lint:briefs`: PASS, no tracked changed briefs found before staging; `npm run lint:briefs:all` was run to validate the new untracked active brief.
  - `npm run lint:briefs:all`: PASS, all 335 brief files including this active brief.
  - `npm run lint`: PASS.
  - `npm run typecheck`: PASS.
  - targeted route/label/support sweep listed above: PASS, no Help/Guide or runbook update needed because labels and recovery behavior are unchanged.
  - `git diff --check`: PASS.
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before PR gates
  - Captured artifact folder: `output/aw-006-admin-content-revision-history-20260521-125407`
  - Captured: `2026-05-21 12:54`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-admin-content-revision-loading-desktop.png`
    - `after-admin-content-revision-error-desktop.png`
    - `after-admin-content-revision-empty-mobile.png`
    - `reference-admin-email-template-history-error-desktop.png`
  - Known visual caveat: screenshots use a temporary local development route rendering the production components with mocked browser API responses; the temporary route and capture script were removed before handoff. The final capture set has no red Next dev issue overlay.
  - No committed product-rendering file changed after the final capture.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`: PASS (`artifacts/test-runs/20260521-150020/verify.log`; full lane because `components/admin/AdminContentManager.tsx` and `tests/unit/admin-content-manager-state.test.tsx` changed; lint, quality gates, admin/env/pr-body lint, eslint, typecheck, 206 unit files / 1177 tests, build, perf budgets, and Playwright 98 passed / 478 skipped).
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-21 | in-progress | started from clean main@7e5df65 after PR #792 and repo-managed closeout PR #793; post-merge preflight was green with no pending closeout; selected Admin Content Manager revision-history state parity as the next bounded AW-006 UI slice using AdminEmailTemplatesManager revision history as the reference | next: update queue/inventory, migrate revision-history state rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-21 | screenshot-review | migrated AdminContentManager revision-history loading, error+retry, and empty states to AdminManagerState; added focused unit coverage for loading, error retry, empty history, and restore behavior; updated AW-006 queue and design inventory; validation passed: targeted Vitest, lint:briefs:all, lint, typecheck, targeted route/label/support sweep, and git diff --check; captured final after/reference screenshot artifacts at output/aw-006-admin-content-revision-history-20260521-125407 after removing the temporary visual route/script | next: wait for owner screenshot approval before running npm run verify:pre-pr`
- `2026-05-21 | screenshot-approved | owner approved screenshot handoff for output/aw-006-admin-content-revision-history-20260521-125407; no committed product-rendering file changed after the final capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-21 | pre-pr-verified | npm run verify:pre-pr passed on full lane with evidence log artifacts/test-runs/20260521-150020/verify.log; perf trend recommendation was hold with worst margin 14.5%, so no stretch-target tightening is due | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
