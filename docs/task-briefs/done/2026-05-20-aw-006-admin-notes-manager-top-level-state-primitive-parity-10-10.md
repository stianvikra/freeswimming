# Task Brief: AW-006 Admin Notes Manager Top-Level State Primitive Parity (10/10)

## Metadata

- `id`: `2026-05-20-aw-006-admin-notes-manager-top-level-state-primitive-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-20`
- `updated`: `2026-05-20`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-20-aw-006-closeout-queue-gate-repair-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-notes-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-20`
- `base`: `main@bf48007`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded parity pass for Admin Notes Manager top-level state rendering.
- `reason`: `main` is clean after AW-006 Closeout Queue And Gate Repair PR `#782` and repo-managed closeout PR `#783`; `npm run post-merge:preflight` reports no pending closeout. The canonical AW-006 queue and notice/empty-state inventory both promote Admin Notes Manager top-level state primitive parity as the next bounded UI slice, and a short code re-audit found top-level local warning, loading, load error+retry, action feedback, empty, and no-results markup in `AdminNotesManager`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin notes surfaces, admin Help/Guide contracts, admin notes recovery runbook, notice/empty-state inventory, `AdminManagerState`, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring Admin Notes Manager top-level feedback and list states into parity with the existing admin-local state primitive without changing note data, authz, API behavior, copy, filters, upload recovery, or related-note workflows.

## Pre-Implementation Owner Explanation

Dette slicen gjor statusmeldingene i Admin Notes-listen mer like resten av admin-systemet: lasting, feil, retry, tom liste, ingen sokeresultater og lagre-/feilmeldinger skal bruke den eksisterende admin-primitive. Det betyr noe fordi Admin Notes er arbeidskoen for operatorarbeid, og lik feedback gjor det lettere aa fortsette trygt. Utenfor scope er kontekst-notater, Content Manager, upload/recovery-logikk, related-note linking, API-er, sok/filter-URL, sortering, copy/labels, authz, Help/Guide, database, Stripe, analytics og bred redesign.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                           | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside Admin Notes Manager top-level state rendering and keep the AW-006 canonical queue accurate after `#782/#783`.                                                     | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Notes warning, loading, load error+retry, action feedback, empty list, and filtered no-results states remain visible, specific, and recoverable where applicable.                            | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated states use the existing `AdminManagerState` visual contract and match the admin manager family without broad redesign or card/layout changes.                                       | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Notes fetches, category/content/product fetches, retry callbacks, search/filter URL behavior, sorting, mutations, attachment recovery, and related-note linking remain unchanged.            | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still see clear refresh/retry/action feedback, empty guidance, and filtered no-results guidance while managing the Notes work queue.                                                  | notes manager tests + screenshot handoff                           | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback uses polite status semantics, recoverable load errors remain announced, and static empty/no-results states are not noisy live regions.                       | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                              | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                                | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load errors keep retry wired to the same loader; empty/no-results states remain deterministic from existing arrays/filters; mutation feedback continues to render near the list. | component tests for retry, empty, no-results, and action feedback  | `5/5`                   |
| Security and authz                            | `target`     | Protected admin notes API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                          | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                          | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing Admin Notes copy and queue/documentation source of truth are preserved or explicitly updated for this slice only.                                                                   | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Note create, refresh, search, filter, edit, done/reopen, delete, attachment, upload recovery, and related-note actions keep existing labels, disabled states, and recovery behavior.         | notes manager tests + screenshot handoff                           | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                            | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                          | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin notes actions continue to use current fetch/mutation behavior.                                               | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches Admin Notes state rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.                   | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                     | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin notes strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                       | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, existing Tailwind/admin classes, and no new dependency or app-wide primitive.                                      | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for migrated Admin Notes top-level states; run targeted tests, brief lint, and required broad gates after screenshot approval.                                | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                                      | helper reuse across one bounded notes surface                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                    | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially `AdminQrLinksManager`, `AdminEmailTemplatesManager`, `AdminCategoriesManager`, `AdminMessagesManager`, and `AdminContextQrPanel`.
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminNotesManager.tsx`; do not move fetches, mutations, route boundaries, URL-filter ownership, or server/client ownership.
  - Route/action/API boundary: `/api/admin/notes`, `/api/admin/notes/[id]`, note attachment routes, related-note routes, category/content/product support fetches, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current response types, form state, edit state, note row type, mutation payloads, filter state, URL params, sorting behavior, attachment recovery state, related-note link/unlink behavior, and fallback error strings.
  - Deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty derives from `items.length`, no-results derives from `filteredItems.length`, and action feedback derives from existing mutation/copy/upload outcomes.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and AW-006 state-color direction.
  - Keep the primitive admin-local; this is one bounded high-value surface parity pass, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Notes states to already-migrated admin manager reference states where practical.
- Testing:
  - Add focused unit/component tests for Admin Notes loading, warning, load error+retry, action feedback, empty state, and no-results state.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Notes, attachments, related notes, categories, content references, and products remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing note IDs, titles, categories, context refs, attachment IDs, and related-note IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, support procedures, Help/Guide assertions, and the Admin Notes recovery runbook. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading notes`
  - `Could not load notes`
  - `No notes created yet`
  - `No notes match the current filters`
  - `Retry`
  - `actionError`
  - `actionNotice`
  - `role="status"`
  - `role="alert"`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminNotesManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-notes-recovery.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Admin Notes Manager top-level states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminNotesManager.tsx` to `AdminManagerState`:
  - schema warning,
  - top-level loading,
  - top-level load error + retry,
  - empty notes list,
  - action error,
  - action notice,
  - filtered no-results.
- Add focused unit/component tests under `tests/unit/`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API unless a tiny compatibility adjustment is required by Admin Notes Manager.
- `AdminContextNotesPanel`.
- `AdminContentManager`.
- Attachment upload or staged image recovery behavior changes.
- Related-note link/unlink behavior changes.
- Admin notes API changes.
- Admin notes copy or workflow label changes.
- Search/filter URL behavior changes.
- Note sorting behavior changes.
- Admin content editor redesign.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note API behavior.
- Admin API behavior, authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminNotesManager` uses the existing `AdminManagerState` helper for the scoped top-level feedback/list-state renderings while preserving copy, callbacks, fetches, mutations, filtering, sorting, attachment recovery, and related-note behavior.
2. Accessibility semantics are explicit: dynamic status/action feedback uses polite status semantics, recoverable errors remain announced, and static empty/no-results states are not live regions.
3. Focused tests cover loading, warning, load error+retry, action feedback, empty notes list, and filtered no-results behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Notes states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - targeted `vitest` for new and touched admin component tests
  - targeted route/label/support sweep
  - `git diff --check`
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before PR gates
  - Captured artifact folder: `output/aw-006-admin-notes-state-20260520195631`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-notes-empty-desktop.png`
    - `after-notes-error-desktop.png`
    - `after-notes-warning-mobile.png`
    - `reference-categories-empty-desktop.png`
  - Known visual caveat: screenshots use a temporary local visual route with mocked admin API responses; the temporary route and capture script were removed before handoff.
  - Final capture note: regenerated after pre-commit formatting against the committed UI diff; no committed product-rendering file changed after `output/aw-006-admin-notes-state-20260520195631`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr` passed on 2026-05-20, full lane; log: `artifacts/test-runs/20260520-194624/verify.log`
    - Unit: 205 files / 1162 tests passed.
    - Build: passed.
    - Perf budgets: passed; trend recommendation `hold` (6/2 green runs, worst margin 14.7% against 15.0% tighten threshold).
    - E2E: 98 passed / 478 skipped.
  - PR required CI checks: pass on PR `#784` after one rerun of an unrelated public-route Playwright flake; final checks passed for `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `CodeQL`, `size-check`, Vercel, and Vercel Preview Comments.
  - `npm run verify:pre-merge`: pass on `8e6d4d7`; reused the fresh full public verify artifact, private-gate regression skipped because `SITE_LOCK_ENABLED!=1`; pass marker recorded by the local pre-merge gate.

## Completion Record

- PR: `#784`
- Merge SHA: `main@a8ae452`
- Rollback: `git revert a8ae452`
- Screenshot artifacts: `output/aw-006-admin-notes-state-20260520195631`, captured 2026-05-20 19:56, comparison type `after/reference`.
- Final visual note: no committed product-rendering file changed after the final screenshot capture.
- `10/10 claim`: yes for the bounded Admin Notes Manager top-level state primitive parity scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                             | Gaps / Notes                                                       |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | PR `#784`, canonical AW-006 queue update, design inventory update, and merged scope stayed inside Admin Notes top-level states.      | No broader AW-006 queue slice claimed.                             |
| UX flow clarity                               | `5/5`          | Migrated warning, loading, load error+retry, action feedback, empty, and no-results states; screenshot handoff approved.             | No Admin Notes workflow labels changed.                            |
| Visual design quality                         | `5/5`          | Reused `AdminManagerState`; after/reference screenshots compare Notes states with mature admin manager references.                   | Temporary screenshot route was local-only and removed.             |
| Business logic correctness and data integrity | `5/5`          | Focused tests and diff review preserved fetches, retry, filters, sorting, mutations, attachment recovery, and related-note behavior. | No API, schema, payload, or URL-filter behavior moved.             |
| Admin editor ergonomics                       | `5/5`          | Admin Notes now shows consistent warning, loading, retry, action feedback, empty, and filtered no-results guidance.                  | No broader notes editor redesign.                                  |
| Accessibility (a11y)                          | `5/5`          | Tests assert status/error semantics and non-live static empty/no-results behavior.                                                   | Manual screenshot review complements role assertions.              |
| Reliability and failure handling              | `5/5`          | Retry remains wired to the same loader; action and load feedback stay visible and recoverable.                                       | No new offline or conflict behavior introduced.                    |
| Security and authz                            | `5/5`          | Admin notes API routes, credentials, authz boundaries, secrets, cookies, and roles were untouched; CI/security checks passed.        | No additional negative-path API tests required for rendering-only. |
| Content governance                            | `5/5`          | Active brief, canonical queue, and design inventory were updated; copy/workflow labels stayed scoped.                                | Help/Guide was N/A because procedures did not change.              |
| Admin workflow and editability                | `5/5`          | Create, refresh, search, filter, edit, done/reopen, delete, attachment, upload recovery, and related-note contracts were preserved.  | No workflow actions were renamed.                                  |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing admin-local helper and Tailwind/admin classes; no dependency/package/config changes.                                 | App-wide state primitive remains out of scope.                     |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                                                 | CI needed one rerun for an unrelated Playwright route flake.       |
| DevOps and rollback readiness                 | `5/5`          | PR `#784` merged cleanly as `main@a8ae452`; rollback is a normal git revert; no migrations/config/workflows changed.                 | Closeout PR is docs-only.                                          |

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-20 | in-progress | started from clean main@bf48007 after AW-006 Closeout Queue And Gate Repair PR #782 and repo-managed closeout PR #783; post-merge preflight found no pending closeout; created branch aw-006-admin-notes-state-parity and active brief for the recommended Admin Notes Manager top-level state primitive parity slice | next: migrate AdminNotesManager top-level state renderings to AdminManagerState and add targeted tests`
- `2026-05-20 | screenshot-review | migrated AdminNotesManager top-level warning, loading, load error+retry, action error/notice, empty, and no-results states to AdminManagerState; updated canonical queue and design inventory; validation passed: npm run lint:briefs:all, targeted Vitest for Admin Notes manager state/related/filter tests (3 files / 19 tests), npm run lint, npm run typecheck, git diff --check, and targeted route/label/support sweep; captured after/reference screenshots in output/aw-006-admin-notes-state-20260520193522 at 2026-05-20 19:35 using a temporary local visual route with mocked admin API responses; the temporary route/script were removed before handoff | next: wait for owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-20 | screenshot-approved | owner approved the after/reference screenshot handoff for Notes empty, Notes load error, Notes warning mobile, and Categories empty reference states | next: run npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-20 | pre-pr-ready | npm run verify:pre-pr passed the full lane with branch-current, migration drift skip, quality gates, eslint, typecheck, unit tests (205 files / 1162 tests), build, performance budgets, and Playwright E2E (98 passed / 478 skipped); evidence: artifacts/test-runs/20260520-194624/verify.log; perf trend recommendation hold | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-20 | final-screenshot-refresh | after commit 3e769f6 and pre-commit formatting, regenerated the after/reference screenshot artifacts from the committed UI diff in output/aw-006-admin-notes-state-20260520195631; removed the temporary local visual route and capture script again; no committed product-rendering file changed after this final capture | next: amend the brief evidence into the commit and rerun npm run verify:pre-pr on the final diff`
- `2026-05-20 | done | PR #784 merged at main@a8ae452 after green local pre-merge and required CI checks; repo-managed closeout moved this brief to done and recorded achieved target scores | next: post-merge preflight should report no pending closeout after the closeout PR merges`
