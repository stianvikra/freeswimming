# Task Brief: AW-006 Admin Content Manager Course-Structure Feedback State Parity (10/10)

## Metadata

- `id`: `2026-05-22-aw-006-admin-content-manager-course-structure-feedback-state-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-inline-form-feedback-state-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-content-course-structure-feedback-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@8bab696`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded course-structure feedback parity pass for `AdminContentManager`.
- `reason`: `main` is clean after PR `#798` and repo-managed closeout `#799`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code re-audit found no selected AW-006 slice and identified one remaining route-local `courseStructureMessage` rendering in `AdminContentManager` that can reuse the existing admin-local `AdminManagerState` helper without changing workflow behavior.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `AdminContentManager`, `AdminManagerState`, admin content Help/Guide contracts, notice/empty-state inventory, screenshot handoff rules, course-structure recovery behavior, or verification lanes change before PR handoff.

## Goal

Bring `AdminContentManager` course-structure feedback messages into parity with the existing admin-local state primitive without changing content APIs, course module/lesson behavior, labels, ordering actions, delete-module strategy, recovery behavior, notes, QR, or support procedures.

## Pre-Implementation Owner Explanation

Vi gjor en liten adminflate mer konsistent: meldingen som vises etter kursstruktur-handlinger skal se ut og oppfore seg som resten av admin-panelets feedback. Det betyr tydeligere visuell kvalitet og bedre tilgjengelighetssemantikk for den som styrer innhold. Utenfor scope er API-er, database, sletting, rekkefolge-logikk, labels, Context Notes, Context QR, supportprosedyrer og bred redesign.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                              | Evidence                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContentManager` course-structure feedback rendering and keep the AW-006 canonical queue accurate after `#798/#799`.                            | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Course-structure feedback remains visible, specific, and close to the owning admin content workflow.                                                                            | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated feedback uses the existing `AdminManagerState` visual contract and matches the admin manager family without broad layout redesign.                                     | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Content fetches, create/update payloads, course-structure normalization/delete actions, dirty-state detection, Context Notes, and Context QR behavior remain unchanged.         | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still get clear local feedback for course-structure follow-up without extra clicks or changed action labels.                                                             | component tests + screenshot handoff                               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic course-structure feedback uses polite status semantics and introduces no unlabeled controls, focus traps, or noisy static empty-state roles.                            | component tests for role/aria + screenshot/manual review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                 | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                   | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                   | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Course-structure feedback remains deterministic from existing component state; retry, loading, mutation, normalization, and delete paths are not changed.                       | component tests for feedback rendering                             | `5/5`                   |
| Security and authz                            | `target`     | Protected admin content API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                           | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                             | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing admin content copy, status model, revision history, ordering, and AW-006 docs source of truth are preserved or explicitly updated for this slice only.                 | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Course-structure normalize, move, delete-module, edit, Context Notes, and Context QR actions keep existing labels, disabled states, and behavior.                               | targeted tests + screenshot handoff                                | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                               | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                             | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin content actions continue to use current behavior.                                               | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches admin content feedback rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data. | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                   | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                        | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, keep the helper API unchanged, and add no dependency.                                                 | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for Content Manager course-structure feedback; run targeted tests, brief lint, screenshot handoff, and broad gates after screenshot approval.    | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                         | helper reuse across one bounded content manager area               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                       | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the already migrated `AdminContentManager` top-level, revision-history, course-workspace, and inline feedback state renderings using `components/admin/AdminManagerState.tsx`.
  - Reuse `AdminManagerState` for `courseStructureMessage`; do not move fetches, mutations, route boundaries, editor placement, or server/client ownership.
  - Route/action/API boundary: `/api/admin/content`, `/api/admin/content/[id]`, course structure actions, category fetches, Context Notes/QR endpoints, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current content row type, create form state, edit form state, course-structure action payloads, dirty-state detection, fallback strings, status filters, and disabled action rules.
  - Deterministic invariant: course-structure feedback renders only from the existing `courseStructureMessage` component state and does not alter mutation success/failure decisions.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and keep the primitive admin-local.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated course-structure feedback to mature `AdminContentManager`/admin-manager state references where practical.
- Testing:
  - Add focused unit/component tests for course-structure feedback semantics.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Admin content rows, course modules, lessons, categories, Context Notes, and QR links remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing content IDs, slugs, titles, statuses, parent IDs, note IDs, and QR IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, support procedures, Help/Guide assertions, and runbooks. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing course-structure feedback rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `courseStructureMessage`
  - `Integrity check`
  - `Select target module before deleting`
  - `Content item was saved, but order normalization failed`
  - `admin-content-course-structure-message-state`
  - `admin-content-course-structure-warning-state`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminContentManager.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-content-manager-state.test.tsx`
  - `tests/unit/admin-manager-state.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-content-parity.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - selected course-structure feedback reuses the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate `courseStructureMessage` rendering in `components/admin/AdminContentManager.tsx` to `AdminManagerState`.
- Preserve existing copy, create/edit/delete/reorder/status actions, course-structure normalize/delete behavior, Context Notes, Context QR, content APIs, and support procedures.
- Add focused unit/component tests under `tests/unit/admin-content-manager-state.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API.
- Admin content API changes.
- Admin content copy or workflow label changes.
- Content create/update/delete/status/course-structure/revision restore behavior changes.
- Module-delete strategy behavior, order-normalization behavior, or admin notes upload/recovery behavior.
- Context Notes or Context QR behavior changes.
- Admin content editor layout redesign.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note/QR API behavior.
- Authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminContentManager` uses the existing `AdminManagerState` helper for `courseStructureMessage` while preserving copy, state updates, callbacks, fetches, action labels, and sibling workflows.
2. Accessibility semantics are explicit: dynamic course-structure feedback uses polite status semantics.
3. Focused tests cover course-structure feedback rendering after a normalization follow-up failure.
4. Canonical AW-006 queue and notice/empty-state inventory no longer say the `#798` closeout is pending after `#799`, and they record this active slice accurately.
5. Screenshot handoff includes `after/reference` artifacts for representative changed Content Manager feedback before `npm run verify:pre-pr`.
6. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx`
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - `npm run lint`
  - `npm run typecheck`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

### Completed Local Evidence Before Screenshot Approval

- `./node_modules/.bin/vitest run tests/unit/admin-content-manager-state.test.tsx tests/unit/admin-manager-state.test.tsx` -> PASS (`17` tests).
- `npm run lint:briefs` -> PASS; changed-brief selector reported no changed task briefs before staging.
- `npm run lint:briefs:all` -> PASS (`338` task briefs).
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS.
- targeted route/label/support sweep -> PASS; hits were expected component/test/docs references only, with no Help/Guide or e2e contract fallout.
- `git diff --check` -> PASS.
- screenshot handoff captured against `http://127.0.0.1:3000` with comparison type `after/reference`:
  - `/Users/stianvikra/freeswimming/output/aw-006-admin-content-course-structure-feedback-2026-05-22-053932`
  - Captured: `2026-05-22 05:39`
  - Files: `after-admin-content-course-structure-feedback-desktop.png`, `after-admin-content-course-structure-feedback-mobile.png`, `reference-admin-content-empty-state-desktop.png`.
  - Temporary local screenshot route/script were removed after capture; `components/admin/AdminContentManager.tsx` has not changed after the capture.
- owner screenshot approval -> PASS (`2026-05-22`, chat approval: `godkjent`).
- `npm run verify:pre-pr` -> PASS full lane:
  - branch-current PASS against `origin/main@8bab696`;
  - unit tests PASS (`206` files, `1182` tests);
  - build PASS;
  - performance budgets PASS with recommendation `hold` (`6/2` weekly green runs, worst margin `14.5%/15.0%`);
  - e2e PASS (`98` passed, `478` skipped).

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-22 | in-progress | started from clean main@8bab696 after PR #798 and repo-managed closeout #799; post-merge preflight was reported green with no pending closeout; short queue/design/code re-audit selected Admin Content Manager course-structure feedback state parity as the next bounded AW-006 UI slice | next: update queue/inventory, migrate scoped feedback rendering, add focused tests, then capture screenshot handoff before broad gates`
- `2026-05-22 | screenshot-review | migrated course-structure feedback to AdminManagerState, added focused unit coverage, updated AW-006 queue/inventory, passed targeted local validation, captured after/reference screenshot artifacts, and stopped before pre-PR gate per visual-review policy | next: wait for owner screenshot approval, then run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-22 | pre-pr-pass | owner approved screenshot handoff and npm run verify:pre-pr passed full lane on current branch with branch-current PASS against origin/main@8bab696 | next: rerun pre-PR after this evidence-only brief update, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
