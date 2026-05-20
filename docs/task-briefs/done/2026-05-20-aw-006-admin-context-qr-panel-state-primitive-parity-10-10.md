# Task Brief: AW-006 Admin Context QR Panel State Primitive Parity (10/10)

## Metadata

- `id`: `2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-20`
- `updated`: `2026-05-20`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-20-aw-006-checkout-success-claim-recovery-clarity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-context-qr-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-20`
- `base`: `main@92ef0db`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded parity pass for Admin Context QR Panel state rendering.
- `reason`: `main` is clean after Checkout Success And Claim Recovery Clarity PR `#778` and repo-managed closeout PR `#779`; `npm run post-merge:preflight` reports no pending closeout. The canonical AW-006 queue still points at the now-done checkout/claim slice, and the re-audit found `AdminContextQrPanel` still using route-local warning, loading, error+retry, action feedback, and empty-state markup while the full QR Registry already uses `AdminManagerState`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin QR surfaces, admin content editor contracts, QR link API contracts, notice/empty-state inventory, `AdminManagerState`, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring the contextual QR panel inside admin content editing into parity with the existing admin-local state primitive without changing QR data, authz, API behavior, copy, or workflow labels.

## Pre-Implementation Owner Explanation

Dette slicen gjor QR-boksen inne i admin content-editoren ryddigere nar den laster, feiler, mangler QR-lenker eller viser en melding etter handling. Det betyr noe fordi admin far samme rolige og forutsigbare feedback her som i QR Registry og de andre nylig ryddede admin-flatene. Utenfor scope er QR-API-er, slug/status-logikk, full QR Registry, Notes, Content Manager, auth, database, Help/Guide-labels og bred designsystem-utrulling.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside the contextual admin QR panel and keep the AW-006 canonical queue accurate after `#778/#779`.                                                | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Context QR warning, loading, load error+retry, action feedback, and no-attached-QR states remain visible, specific, and recoverable where applicable.                   | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated states use the existing `AdminManagerState` visual contract and match the QR Registry/admin manager family without broad redesign.                             | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Fetch paths, retry callbacks, create/update/delete payloads, copied-link behavior, status toggles, item ordering, and fallback strings remain unchanged.                | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still see clear inline QR loading, retry, empty guidance, and mutation feedback while staying inside the content edit flow.                                      | context QR panel tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback uses polite status semantics, recoverable load errors remain announced, and static empty states are not noisy live regions.             | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.         | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.           | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                           | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load errors keep retry wired to the same loader; empty state remains deterministic from existing arrays; mutation errors continue to render near the panel. | component tests for retry, empty, and action feedback states       | `5/5`                   |
| Security and authz                            | `target`     | Protected admin QR API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                        | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                     | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin QR copy and queue/documentation source of truth are preserved or explicitly updated for this slice only.                                                 | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Context QR create, retry, edit, activate/deactivate, copy, open, reset, and delete actions keep existing labels, disabled states, confirmation, and recovery behavior.  | panel tests + screenshot handoff                                   | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                       | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                     | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin QR actions continue to use current fetch/mutation behavior.                             | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches QR panel state rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data. | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                           | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin QR strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.     | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, existing Tailwind/admin classes, and no new dependency or app-wide primitive.                 | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for migrated Admin Context QR states; run targeted tests, brief lint, and required broad gates after screenshot approval.                | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                 | helper reuse across one bounded contextual surface                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                               | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated full QR Registry state rendering in `AdminQrLinksManager` plus the admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`.
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminContextQrPanel.tsx`; do not move fetches, mutations, route boundaries, or server/client ownership.
  - Route/action/API boundary: `/api/admin/qr-links` and `/api/admin/qr-links/[id]` remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current response types, form state, edit state, QR row type, mutation payloads, status toggles, copied-link behavior, confirmation behavior, and fallback error strings.
  - Deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty derives from `items.length`, action feedback derives from existing mutation/copy failures or successes.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and AW-006 state-color direction.
  - Keep the primitive admin-local; this is one bounded contextual parity pass, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Context QR states to already-migrated QR Registry states where practical.
- Testing:
  - Add focused unit/component tests for contextual QR loading, warning, load error+retry, empty state, and action feedback.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. QR links remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing QR link IDs, slugs, destinations, statuses, and placement keys are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, and support procedures. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading QR links for this content`
  - `Could not load QR links for this content`
  - `No QR links attached yet`
  - `QR link created`
  - `Stable link copied`
  - `Could not copy stable link`
  - `Retry`
  - `actionError`
  - `actionNotice`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminContextQrPanel.tsx`
  - `components/admin/AdminQrLinksManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/runbooks/`
- Expected fallout:
  - Admin Context QR panel reuses the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide runtime update unless a workflow label changes.

## Scope

- Migrate these state renderings in `components/admin/AdminContextQrPanel.tsx` to `AdminManagerState`:
  - schema warning,
  - action error,
  - action notice,
  - contextual loading,
  - contextual load error + retry,
  - no attached QR links empty state.
- Add focused unit/component tests under `tests/unit/`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API unless a tiny compatibility adjustment is required by Admin Context QR Panel.
- Full QR Registry changes beyond reference comparison.
- Admin notes/content upload recovery migrations.
- Admin content editor layout redesign.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or QR API behavior.
- Admin API behavior, authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.
- Changing admin copy, workflow labels, retry callbacks, mutation payloads, delete confirmation meaning, slug/status behavior, or support procedures.

## Acceptance Criteria

1. `AdminContextQrPanel` uses the existing `AdminManagerState` helper for the scoped feedback/list-state renderings while preserving copy, callbacks, fetches, mutations, and derived QR conditions.
2. Accessibility semantics are explicit: dynamic status/action feedback uses polite status semantics, recoverable errors remain announced, and static empty states are not live regions.
3. Focused tests cover loading, warning, load error+retry, empty contextual QR state, and action feedback behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Context QR states before `npm run verify:pre-pr`.
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
  - Captured artifact folder: `output/aw-006-admin-context-qr-state-2026-05-20-124131`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-context-qr-empty-desktop.png`
    - `after-context-qr-error-desktop.png`
    - `after-context-qr-warning-mobile.png`
    - `reference-qr-registry-empty-desktop.png`
  - Known visual caveat: screenshots use a temporary local visual route with mocked QR/content API responses; the temporary route and capture script were removed before handoff, and no product-rendering file changed after the final capture.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr` passed on 2026-05-20, full lane; log: `artifacts/test-runs/20260520-124614/verify.log`
    - Unit: 204 files / 1155 tests passed.
    - Build: passed.
    - Perf budgets: passed; trend recommendation `hold` (6/2 green runs, worst margin 14.7% against 15.0% tighten threshold).
    - E2E: 98 passed / 478 skipped.
  - PR required CI checks: pass on PR `#780`, including `verify`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `CodeQL`, `size-check`, Vercel, and Vercel Preview Comments.
  - `npm run verify:pre-merge`: pass on `0c97b32`; full lane selected, 204 unit test files / 1155 tests passed, build passed, perf budgets passed, Playwright E2E passed with 98 passed / 478 skipped; private-gate regression skipped because `SITE_LOCK_ENABLED!=1`; pass marker `artifacts/verify-pre-merge/20260520-113635.json`.

## Closeout Evidence

- PR: `#780`
- Merge SHA: `main@0c98935`
- Rollback: `git revert 0c98935`
- Screenshot artifacts: `output/aw-006-admin-context-qr-state-2026-05-20-124131`, captured 2026-05-20 12:42, comparison type `after/reference`.
- Final visual note: no product-rendering files changed after the approved screenshot capture.
- `10/10 claim`: yes for the bounded Admin Context QR Panel state primitive parity scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                   | Gaps / Notes                                             |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#780`, canonical AW-006 queue update, design inventory update, and merged scope stayed inside the contextual QR panel. | No broader AW-006 queue slice claimed.                   |
| UX flow clarity                               | `5/5`          | Migrated warning, loading, load error+retry, action feedback, and empty states; screenshot handoff approved.               | No QR workflow label changes.                            |
| Visual design quality                         | `5/5`          | Reused `AdminManagerState`; after/reference screenshots compare Context QR states with QR Registry reference.              | Temporary screenshot route was local-only and removed.   |
| Business logic correctness and data integrity | `5/5`          | Focused tests prove prefill, retry, empty, action feedback, and unchanged create payload behavior.                         | No API, schema, status, slug, or payload behavior moved. |
| Admin editor ergonomics                       | `5/5`          | Admin Context QR panel now shows consistent inline loading, retry, empty guidance, warning, and mutation feedback.         | Full content editor redesign remains out of scope.       |
| Accessibility (a11y)                          | `5/5`          | Tests assert status/error semantics and non-live static empty state behavior.                                              | Manual screenshot review complements role assertions.    |
| Reliability and failure handling              | `5/5`          | Retry remains wired to the same loader; load/action error states stay visible and recoverable.                             | No new fallback or offline behavior introduced.          |
| Security and authz                            | `5/5`          | Admin API routes, credentials, authz boundaries, secrets, cookies, and roles were untouched; CI/security checks passed.    | No additional negative-path API tests required.          |
| Content governance                            | `5/5`          | Active brief, canonical queue, and design inventory were updated; copy/workflow labels stayed scoped.                      | Help/Guide was N/A because procedures did not change.    |
| Admin workflow and editability                | `5/5`          | Create, retry, edit, activate/deactivate, copy, open, reset, and delete contracts were preserved by tests/diff review.     | No workflow actions were renamed.                        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing admin-local helper and Tailwind/admin classes; no dependency/package/config changes.                       | App-wide state primitive remains out of scope.           |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                                       | Private-gate local rerun skipped; CI site-lock passed.   |
| DevOps and rollback readiness                 | `5/5`          | PR `#780` merged cleanly as `main@0c98935`; rollback is a normal git revert; no migrations/config/workflows changed.       | Closeout PR is docs-only.                                |

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-20 | in-progress | started from clean main@92ef0db after PR #778 and repo-managed closeout PR #779; post-merge preflight found no pending closeout; created branch aw-006-admin-context-qr-state-parity and active brief for the recommended Admin Context QR Panel State Primitive Parity slice | next: migrate AdminContextQrPanel state renderings to AdminManagerState and add targeted tests`
- `2026-05-20 | in-progress | migrated AdminContextQrPanel warning, loading, load error+retry, action error, action notice, and empty states to AdminManagerState without changing QR API calls, payloads, labels, or callbacks; updated the canonical AW-006 queue and design inventory; targeted vitest, lint:briefs:all, lint, typecheck, git diff --check, and route/label sweep passed | next: capture required after/reference screenshot handoff before verify:pre-pr`
- `2026-05-20 | screenshot-review | captured after/reference screenshots in output/aw-006-admin-context-qr-state-2026-05-20-122501 at 2026-05-20 12:38 using a temporary local route with mocked QR/content API responses; the temporary route and capture script were removed before handoff; targeted vitest, lint:briefs:all, and git diff --check passed after cleanup | next: wait for owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-20 | screenshot-review | owner flagged missing color/visual weight in the empty state; added a stronger contextual empty-state title and blue-tinted treatment while preserving QR copy, actions, and data behavior; refreshed after/reference screenshots in output/aw-006-admin-context-qr-state-2026-05-20-124131 at 2026-05-20 12:42; temporary route and capture script were removed after capture | next: wait for owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-20 | screenshot-approved | owner approved the refreshed after/reference screenshot handoff in output/aw-006-admin-context-qr-state-2026-05-20-124131; no final product-rendering files changed after the approved capture | next: run npm run verify:pre-pr on the final pre-PR diff`
- `2026-05-20 | pre-pr-gate | npm run verify:pre-pr passed full lane with branch-current current to origin/main@92ef0db, lint/typecheck/unit/build/perf/e2e green; artifact log artifacts/test-runs/20260520-124614/verify.log; perf trend recommendation hold, so no stretch-target tightening recorded for this slice | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-20 | done | PR #780 merged at main@0c98935 after green local pre-merge and CI checks; repo-managed closeout moved this brief to done and recorded achieved target scores | next: post-merge preflight should report no pending closeout`
