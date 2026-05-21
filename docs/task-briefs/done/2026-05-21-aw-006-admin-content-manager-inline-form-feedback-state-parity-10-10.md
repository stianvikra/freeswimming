# Task Brief: AW-006 Admin Content Manager Inline Form Feedback State Parity (10/10)

## Metadata

- `id`: `2026-05-21-aw-006-admin-content-manager-inline-form-feedback-state-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-21`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-course-workspace-empty-state-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-content-inline-feedback-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-21`
- `base`: `main@44df95d`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded inline form feedback parity pass for `AdminContentManager`.
- `reason`: `main` is clean after PR `#796` and repo-managed closeout `#797`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code re-audit found no selected AW-006 slice and identified four small route-local inline feedback renderings in `AdminContentManager` that can reuse the existing admin-local `AdminManagerState` helper without changing workflow behavior.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContentManager`, `AdminManagerState`, admin content Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring selected `AdminContentManager` inline form feedback states into parity with the existing admin-local state primitive without changing content APIs, course module/lesson behavior, labels, ordering, publish state, notes, QR, recovery behavior, or support procedures.

## Pre-Implementation Owner Explanation

Jeg skal rydde fire sma meldingsflater i Admin Content Manager slik at feilmeldinger og varsler inne i skjemaer ser ut og oppforer seg som resten av admin-panelet. Det betyr jevnere visuell kvalitet og bedre tilgjengelighetssemantikk. Utenfor scope er API-er, lagring, publisering, kursstruktur-recovery, Context Notes, Context QR, labels og alle arbeidsflytendringer.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` inline form feedback rendering and keep the AW-006 canonical queue accurate after `#796/#797`.                                      | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Workspace lesson create errors, edit dirty warnings, edit errors, and create-form setup warnings remain visible, specific, and close to their owning form context.                   | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated inline feedback uses the existing `AdminManagerState` visual contract and matches the admin manager family without broad layout redesign.                                   | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Content fetches, category fetches, create/update payloads, dirty-state detection, course workspace focus, status actions, Context Notes, and Context QR behavior remain unchanged.   | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still get clear local feedback while creating lessons, editing content, and seeing setup warnings without extra clicks or changed action labels.                              | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic inline form feedback uses polite status semantics where appropriate and introduces no unlabeled controls, focus traps, or noisy static empty-state roles.                    | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                      | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                        | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                        | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Inline errors and warnings remain deterministic from existing component state; retry, loading, mutation, and recovery paths are not changed.                                         | component tests for error/warning rendering                        | `5/5`                   |
| Security and authz                            | `target`     | Protected admin content API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                  | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin content copy, status model, revision history, ordering, and AW-006 docs source of truth are preserved or explicitly updated for this slice only.                      | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Create lesson, save edit, cancel edit, setup warning, module scope, Context Notes, and Context QR actions keep existing labels, disabled states, and behavior.                       | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                    | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                  | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin content actions continue to use current behavior.                                                    | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin content form feedback rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data. | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                        | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                             | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                     | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, keep the helper API unchanged, and add no dependency.                                                      | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for Content Manager inline form feedback; run targeted tests, brief lint, screenshot handoff, and broad gates after screenshot approval.              | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                              | helper reuse across one bounded content manager area               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                            | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the already migrated `AdminContentManager` top-level, revision-history, and course-workspace state renderings using `components/admin/AdminManagerState.tsx`.
  - Reuse `AdminManagerState` inside the `AdminContentManager` inline form feedback slots; do not move fetches, mutations, route boundaries, editor placement, or server/client ownership.
  - Route/action/API boundary: `/api/admin/content`, `/api/admin/content/[id]`, course structure actions, category fetches, Context Notes/QR endpoints, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current content row type, create form state, edit form state, workspace lesson create state, dirty-state detection, fallback strings, status filters, and disabled action rules.
  - Deterministic invariants: create setup warning renders only when schema is not ready, workspace lesson create error renders after failed contextual lesson creation, dirty warning renders when edit state differs from baseline, and edit error renders after failed edit save.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and keep the primitive admin-local.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated inline feedback states to mature `AdminContentManager`/admin-manager state references where practical.
- Testing:
  - Add focused unit/component tests for inline form feedback semantics.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin content rows, course modules, lessons, categories, Context Notes, and QR links remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing content IDs, slugs, titles, statuses, parent IDs, note IDs, and QR IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing inline form feedback rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Could not create lesson`
  - `You have unsaved changes`
  - `Could not save content changes`
  - `Setup is not ready yet`
  - `admin-workspace-lesson-create-error-state`
  - `admin-content-edit-dirty-state`
  - `admin-content-edit-error-state`
  - `admin-content-create-schema-warning-state`
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
  - selected inline feedback states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminContentManager.tsx` to `AdminManagerState`:
  - workspace lesson create error,
  - edit-form dirty warning,
  - edit-form save error,
  - create-form setup/schema warning.
- Preserve existing copy, create/edit/delete/reorder/status actions, overview guidance, course structure messages, Context Notes, Context QR, content APIs, and support procedures.
- Add focused unit/component tests under `tests/unit/admin-content-manager-state.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API.
- Admin content API changes.
- Admin content copy or workflow label changes.
- Content create/update/delete/status/course-structure/revision restore behavior changes.
- `courseStructureMessage`, module-delete recovery, order-normalization recovery, or admin notes upload/recovery behavior.
- Context Notes or Context QR behavior changes.
- Admin content editor layout redesign.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note/QR API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminContentManager` uses the existing `AdminManagerState` helper for the scoped inline feedback renderings while preserving copy, callbacks, fetches, form state, dirty-state detection, action labels, and sibling workflows.
2. Accessibility semantics are explicit: dynamic inline feedback uses polite status semantics where appropriate.
3. Focused tests cover workspace lesson create error, edit dirty warning, edit save error, and create setup warning behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Content Manager inline feedback states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - PASS: `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx` (2 files, 16 tests)
  - PASS: `npm run lint:briefs` (no changed task briefs detected by that command at the time of the run)
  - PASS: `npm run lint:briefs:all` (337 brief files, after removing stale done-brief titles from the active queue language)
  - PASS: `npm run lint`
  - PASS: `npm run typecheck`
  - PASS: targeted route/label/support sweep listed above; no Help/Guide, runbook, API, Context Notes, or QR fallout found
  - PASS: `git diff --check`
- Visual gate:
  - PASS: started local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - PASS: captured representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - PASS: owner approved screenshot handoff in chat on `2026-05-21`
  - Artifacts: `output/aw-006-admin-content-inline-feedback-2026-05-21-210823`
  - Captured: `2026-05-21 21:08`
  - Files:
    - `after-admin-content-inline-create-warning-desktop.png`
    - `after-admin-content-workspace-create-error-desktop.png`
    - `after-admin-content-edit-feedback-desktop.png`
    - `reference-admin-content-top-level-empty-desktop.png`
  - Caveat: screenshots use a temporary local visual route with mocked browser API responses; the temporary route and capture script were removed before handoff.
  - Stop for owner screenshot approval before PR gates.
- Broad gates after screenshot approval:
  - PASS: `npm run verify:pre-pr` (full lane; branch-current, quality gates, lint, typecheck, unit, build, performance budgets, and E2E)
  - Performance trend decision: hold current budgets for this slice because the perf gate recommended `hold` (weekly green runs met, worst margin `14.5%` stayed below the `15.0%` tighten threshold).
  - PASS: PR required CI checks for `#798`; Analyze, CodeQL, Vercel, Vercel Preview Comments, deploy-preview, e2e-smoke, site-lock-smoke, size-check, and verify were green before merge.
  - PASS: `npm run verify:pre-merge` (branch-current, public-mode verify reuse, build/perf/E2E evidence; marker `artifacts/verify-pre-merge/20260521-230515.json`, reused run `artifacts/test-runs/20260521-212735`).

## Completion Record

- PR: `#798`
- Merge SHA: `main@7be94d4`
- Rollback: `git revert 7be94d4`
- Screenshot artifacts: `output/aw-006-admin-content-inline-feedback-2026-05-21-210823`, captured 2026-05-21 21:08, comparison type `after/reference`.
- Final visual note: no product-rendering files changed after the approved screenshot capture.
- `10/10 claim`: yes for the bounded Admin Content Manager inline form feedback state parity scope; all critical target categories are scored `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                       | Gaps / Notes                                                |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#798`, canonical AW-006 queue update, design inventory update, and merged scope stayed inside selected Admin Content Manager inline feedback states.       | No next AW-006 implementation slice is selected.            |
| UX flow clarity                               | `5/5`          | Workspace lesson create errors, edit dirty warnings, edit errors, and create-form setup warnings remain visible and close to the owning form context.          | No workflow labels changed.                                 |
| Visual design quality                         | `5/5`          | Reused `AdminManagerState`; after/reference screenshots compare changed inline feedback states with the mature admin manager reference.                        | Temporary screenshot route was local-only and removed.      |
| Business logic correctness and data integrity | `5/5`          | Focused tests and diff review preserved fetches, create/update payloads, dirty-state detection, course workspace behavior, Context Notes, and Context QR.      | No API, schema, payload, or ordering behavior changed.      |
| Admin editor ergonomics                       | `5/5`          | Admins now see consistent inline feedback while creating lessons, editing content, and seeing setup warnings.                                                  | Full admin content editor redesign remains out of scope.    |
| Accessibility (a11y)                          | `5/5`          | Tests assert appropriate status semantics for dynamic inline feedback and no noisy live region for the static setup warning.                                   | Manual screenshot review complements role assertions.       |
| Reliability and failure handling              | `5/5`          | Error and warning states remain deterministic from existing component state; retry, loading, mutation, and recovery paths were not changed.                    | No new failure mode introduced.                             |
| Security and authz                            | `5/5`          | Admin API routes, credentials, authz boundaries, secrets, cookies, and roles were untouched; CI/security checks passed.                                        | No additional negative-path API tests required for UI-only. |
| Content governance                            | `5/5`          | Existing admin content copy, status model, ordering, queue, and design inventory were preserved or updated for this slice only.                                | Help/Guide remained N/A because procedures did not change.  |
| Admin workflow and editability                | `5/5`          | Create lesson, save edit, cancel edit, setup warning, module scope, Context Notes, and Context QR actions kept existing labels, disabled states, and behavior. | No workflow actions were renamed.                           |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing admin-local helper; no dependency/package/config changes.                                                                                      | App-wide state primitive remains out of scope.              |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `verify:pre-pr`, CI, and `verify:pre-merge` passed.                                                                                           | Private-gate local rerun skipped; CI site-lock passed.      |
| DevOps and rollback readiness                 | `5/5`          | PR `#798` merged cleanly as `main@7be94d4`; rollback is a normal git revert; no migrations/config/workflows changed.                                           | Closeout PR is docs-only.                                   |

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-21 | in-progress | started from clean main@44df95d after PR #796 and repo-managed closeout #797; post-merge preflight was reported green with no pending closeout; selected Admin Content Manager inline form feedback state parity as the next bounded AW-006 UI slice after a fresh queue/design/code re-audit | next: update queue/inventory, migrate scoped inline feedback rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-21 | screenshot-review | migrated scoped inline form feedback states to AdminManagerState, added focused unit coverage, updated AW-006 queue/design inventory, passed targeted Vitest, brief lint, lint, typecheck, targeted route/label/support sweep, and git diff check; captured after/reference screenshots in output/aw-006-admin-content-inline-feedback-2026-05-21-210823 and removed the temporary local visual route/script before handoff | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-21 | screenshot-approved | owner approved the screenshot handoff in chat, allowing the workstream to continue into the pre-PR gate sequence | next: run npm run verify:pre-pr`
- `2026-05-21 | pre-pr-ready | npm run verify:pre-pr passed the full lane with branch-current, quality gates, lint, typecheck, 206 unit files / 1181 tests, build, performance budgets, and Playwright E2E (98 passed, 478 skipped); performance trend recommendation was hold, not tighten, because worst margin was 14.5% against the 15.0% tighten threshold | next: stage, commit, push, and open PR`
- `2026-05-22 | done | PR #798 merged to main at 7be94d4 after green CI and local pre-merge gate; repo-managed post-merge preflight surfaced this docs-only closeout and moved the brief to done | next: validate and merge the closeout PR, then rerun post-merge preflight`
