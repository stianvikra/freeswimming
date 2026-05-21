# Task Brief: AW-006 Admin Content Manager Course Workspace Empty-State Parity (10/10)

## Metadata

- `id`: `2026-05-21-aw-006-admin-content-manager-course-workspace-empty-state-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-21`
- `updated`: `2026-05-21`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-revision-history-state-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-content-workspace-empty-state-parity`
- `merged_pr`: `#796`
- `merged_commit`: `ff9eb34`

## Brief Audit Record

- `last_audited`: `2026-05-21`
- `base`: `main@a383562`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded course-workspace empty-state parity pass for `AdminContentManager`.
- `reason`: `main` is clean after PR `#794` and repo-managed closeout PR `#795`; post-merge preflight was green with no pending closeout. A fresh queue/design/code re-audit found no selected AW-006 slice and identified two remaining route-local course-workspace empty-state paragraphs in `AdminContentManager` that can safely reuse the existing admin-local `AdminManagerState` helper.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContentManager`, `AdminManagerState`, admin content Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring `AdminContentManager` course-workspace empty states into parity with the existing admin-local state primitive without changing content APIs, course module/lesson behavior, labels, ordering, publish state, notes, QR, or support procedures.

## Pre-Implementation Owner Explanation

Jeg skal gjore en liten konsistensjobb i admin-kurset der tomme modul- og leksjonsomrader vises. Poenget er at "her finnes det ingen leksjoner ennaa" skal se og oppfore seg som de andre ryddige admin-meldingene, uten aa endre innhold, publisering, rekkefolge, QR, notater eller API-er.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` course-workspace empty-state rendering and keep the AW-006 canonical queue accurate after `#794/#795`.                                   | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Module lesson-preview empty state and focused module empty state remain visible, specific, and close to the relevant course-workspace context.                                            | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated empty states use the existing `AdminManagerState` visual contract and match the admin manager family without broad layout redesign.                                              | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Course module/lesson fetches, grouping, focus mode, create/edit/delete/reorder actions, status actions, Context Notes, and Context QR behavior remain unchanged.                          | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still see clear empty guidance while scanning modules and while focusing a module with no lessons.                                                                                 | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Static course-workspace empty states are not noisy live regions and do not introduce focus traps or unlabeled controls.                                                                   | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                           | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                             | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                             | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Empty states remain deterministic from existing module/lesson arrays and focus state; no retry, loading, or mutation path is changed.                                                     | component tests for overview and focused empty states              | `5/5`                   |
| Security and authz                            | `target`     | Protected admin content API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                     | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                       | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin content copy, module/lesson status model, ordering, and AW-006 docs source of truth are preserved or explicitly updated for this slice only.                               | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Module scope, add lesson, edit module/lesson, delete, preview, move, status, Context Notes, and Context QR actions keep existing labels, disabled states, and behavior.                   | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                         | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                       | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin content actions continue to use current behavior.                                                         | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin content course-workspace rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.   | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                             | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                  | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                          | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, model the mature admin manager state surface, and add no dependency.                                            | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for Content Manager course-workspace empty states; run targeted tests, brief lint, screenshot handoff, and required broad gates after screenshot approval. | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                                   | helper reuse across one bounded content manager area               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                 | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the already migrated `AdminContentManager` top-level and revision-history state renderings using `components/admin/AdminManagerState.tsx`.
  - Reuse `AdminManagerState` inside the `AdminContentManager` course-workspace lesson-preview and focused-module empty states; do not move fetches, mutations, route boundaries, editor placement, or server/client ownership.
  - Route/action/API boundary: `/api/admin/content`, `/api/admin/content/[id]`, course structure actions, category fetches, Context Notes/QR endpoints, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current content row type, workspace item types, module/lesson grouping, focus state, fallback strings, status filters, and disabled action rules.
  - Deterministic invariants: module preview empty state renders when the module has no linked lessons, focused module empty state renders when the selected workspace has no lessons, and both remain static non-live guidance.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and keep the primitive admin-local.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Content Manager course-workspace empty states to a mature admin manager empty-state reference where practical.
- Testing:
  - Add focused unit/component tests for course workspace module-preview empty state and focused-module empty state semantics.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin content rows, course modules, lessons, categories, Context Notes, and QR links remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing content IDs, slugs, titles, statuses, parent IDs, note IDs, and QR IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing course-workspace empty-state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `No lessons linked to this module yet`
  - `No lessons in this module yet`
  - `admin-course-workspace-overview-guidance`
  - `Course workspace overview`
  - `Module workspace`
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
  - Content Manager course-workspace empty states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminContentManager.tsx` course workspace to `AdminManagerState`:
  - module lesson-preview empty state,
  - focused module empty lesson workspace state.
- Preserve existing overview guidance, module/lesson list markup, create/edit/delete/reorder actions, preview links, status actions, Context Notes, Context QR, and content APIs.
- Add focused unit/component tests under `tests/unit/admin-content-manager-state.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API.
- Admin content API changes.
- Admin content copy or workflow label changes.
- Content create/update/delete/status/course-structure/revision restore behavior changes.
- Context Notes or Context QR behavior changes.
- Admin content editor layout redesign.
- Admin notes upload/recovery behavior.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note/QR API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminContentManager` uses the existing `AdminManagerState` helper for scoped course-workspace empty states while preserving copy, callbacks, fetches, grouping, focus state, action labels, and sibling workflows.
2. Accessibility semantics are explicit: static empty states are not live regions.
3. Focused tests cover module-preview empty state and focused-module empty state behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Content Manager course-workspace states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx`: PASS, 2 files / 14 tests.
  - `npm run lint:briefs`: PASS, no tracked changed briefs found before staging; `npm run lint:briefs:all` was run to validate the new untracked active brief.
  - `npm run lint:briefs:all`: PASS, all 336 brief files including this active brief.
  - `npm run lint`: PASS.
  - `npm run typecheck`: PASS.
  - targeted route/label/support sweep listed above: PASS, no Help/Guide or runbook update needed because labels and recovery behavior are unchanged.
  - `git diff --check`: PASS.
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before PR gates
  - Captured artifact folder: `output/aw-006-admin-content-workspace-empty-state-2026-05-21-193533`
  - Captured: `2026-05-21 19:35`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-admin-content-course-workspace-overview-empty-desktop.png`
    - `after-admin-content-course-workspace-focused-empty-desktop.png`
    - `after-admin-content-course-workspace-focused-empty-mobile.png`
    - `reference-admin-content-top-level-empty-desktop.png`
  - Known visual caveat: screenshots use a temporary local development route rendering the production component with mocked browser API responses; the temporary route and capture script were removed before handoff.
  - No committed product-rendering file changed after the final capture.
  - Owner screenshot approval: PASS, approved in chat on `2026-05-21` before broad PR gates.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`: PASS, full lane; 1179 unit tests passed, build passed, perf budgets passed, Playwright E2E passed with 98 passed / 478 skipped; log `artifacts/test-runs/20260521-194135/verify.log`.
  - PR required CI checks for `#796`: PASS; Analyze, CodeQL, Vercel, Vercel Preview Comments, deploy-preview, e2e-smoke, site-lock-smoke, size-check, and verify were green before merge.
  - `npm run verify:pre-merge`: PASS, full lane; branch-current, public-mode verify, build, perf budget, and Playwright E2E passed with 98 passed / 478 skipped; marker `artifacts/verify-pre-merge/20260521-181147.json`, log `artifacts/test-runs/20260521-200547/verify.log`.

## Completion Record

- PR: `#796`
- Merge SHA: `main@ff9eb34`
- Rollback: `git revert ff9eb34`
- Screenshot artifacts: `output/aw-006-admin-content-workspace-empty-state-2026-05-21-193533`, captured 2026-05-21 19:35, comparison type `after/reference`.
- Final visual note: no product-rendering files changed after the approved screenshot capture.
- `10/10 claim`: yes for the bounded Admin Content Manager course-workspace empty-state parity scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                  | Gaps / Notes                                                    |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#796`, canonical AW-006 queue update, design inventory update, and merged scope stayed inside Admin Content Manager course workspace.                 | No next AW-006 implementation slice is selected.                |
| UX flow clarity                               | `5/5`          | Module lesson-preview and focused module empty states remain visible, specific, and close to the relevant course-workspace context.                       | No workflow labels changed.                                     |
| Visual design quality                         | `5/5`          | Reused `AdminManagerState`; after/reference screenshots compare course-workspace empty states with the mature admin manager reference.                    | Temporary screenshot route was local-only and removed.          |
| Business logic correctness and data integrity | `5/5`          | Focused tests and diff review preserved fetches, grouping, focus mode, create/edit/delete/reorder actions, status actions, Context Notes, and Context QR. | No API, schema, payload, or ordering behavior changed.          |
| Admin editor ergonomics                       | `5/5`          | Admins now see consistent empty-state guidance while scanning modules and focusing a module with no lessons.                                              | Full admin content editor redesign remains out of scope.        |
| Accessibility (a11y)                          | `5/5`          | Tests assert static empty states are not live regions and introduce no role noise.                                                                        | Manual screenshot review complements role assertions.           |
| Reliability and failure handling              | `5/5`          | Empty states remain deterministic from existing module/lesson arrays and focus state; no retry/loading/mutation path changed.                             | No new failure mode introduced.                                 |
| Security and authz                            | `5/5`          | Admin API routes, credentials, authz boundaries, secrets, cookies, and roles were untouched; CI/security checks passed.                                   | No additional negative-path API tests required for UI-only fix. |
| Content governance                            | `5/5`          | Brief, queue, and design inventory were updated; copy/workflow labels stayed scoped.                                                                      | Help/Guide remained N/A because procedures did not change.      |
| Admin workflow and editability                | `5/5`          | Module scope, add lesson, edit module/lesson, delete, preview, move, status, Context Notes, and Context QR actions were preserved.                        | No workflow actions were renamed.                               |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing admin-local helper; no dependency/package/config changes.                                                                                 | App-wide state primitive remains out of scope.                  |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                                                                      | Private-gate local rerun skipped; CI site-lock passed.          |
| DevOps and rollback readiness                 | `5/5`          | PR `#796` merged cleanly as `main@ff9eb34`; rollback is a normal git revert; no migrations/config/workflows changed.                                      | Closeout PR is docs-only.                                       |

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-21 | in-progress | started from clean main@a383562 after PR #794 and repo-managed closeout PR #795; post-merge preflight was green with no pending closeout; selected Admin Content Manager course workspace empty-state parity as the next bounded AW-006 UI slice after a fresh queue/design/code re-audit | next: update queue/inventory, migrate course-workspace empty-state rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-21 | screenshot-review | migrated AdminContentManager course-workspace module-preview and focused-module empty states to AdminManagerState; added focused unit coverage and a jsdom scrollIntoView test mock for existing component behavior; updated AW-006 queue and design inventory; validation passed: targeted Vitest, lint:briefs:all, lint, typecheck, targeted route/label/support sweep, and git diff --check; captured after/reference screenshots in output/aw-006-admin-content-workspace-empty-state-2026-05-21-193533 after removing the temporary local visual route/script | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, PR creation, CI, and npm run verify:pre-merge`
- `2026-05-21 | pre-pr-verified | owner approved screenshot handoff; npm run verify:pre-pr passed full lane with unit, build, perf budget, and Playwright coverage; no committed product-rendering file changed after final screenshot capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-21 | merged | PR #796 merged to main at ff9eb34 after required CI and npm run verify:pre-merge passed; post-merge preflight requested this repo-managed docs-only brief closeout | next: validate, merge closeout PR, sync main, and rerun post-merge preflight`
- `2026-05-21 | done | repo-managed closeout moved this brief to done, recorded achieved target scores, and cleared the AW-006 queue/inventory active-slice state after PR #796 | next: post-merge preflight should report no pending closeout`
