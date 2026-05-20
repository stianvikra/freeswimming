# Task Brief: AW-006 Admin Context Notes Panel State Primitive Parity (10/10)

## Metadata

- `id`: `2026-05-20-aw-006-admin-context-notes-panel-state-primitive-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-20`
- `updated`: `2026-05-20`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-20-aw-006-admin-notes-manager-top-level-state-primitive-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-context-notes-state-parity`

## Brief Audit Record

- `last_audited`: `2026-05-20`
- `base`: `main@803aafe`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a bounded parity pass for `AdminContextNotesPanel` state rendering.
- `reason`: `main` is clean after Admin Notes Manager state parity PR `#784` and repo-managed closeout PR `#785`; `npm run post-merge:preflight` reports no pending closeout. The canonical AW-006 queue intentionally leaves the next slice unselected pending re-audit, and a short queue/design/code re-audit found `AdminContextNotesPanel` still using route-local warning, loading, load error+retry, action feedback, and empty-state markup while its sibling Context QR panel and top-level Admin Notes manager already use `AdminManagerState`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin context notes surfaces, admin Help/Guide contracts, admin notes recovery runbook, notice/empty-state inventory, `AdminManagerState`, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Bring contextual admin notes panel feedback and empty states into parity with the existing admin-local state primitive without changing note data, authz, API behavior, copy, attachments, related-note links, or content-editor workflows.

## Pre-Implementation Owner Explanation

Dette slicen gjor statusmeldingene i kontekst-notatpanelet inne i admin-editoren mer like resten av admin-systemet: lasting, feil, retry, tom liste og lagre-/feilmeldinger skal bruke den eksisterende admin-primitive. Det betyr noe fordi admin naa faar samme type feedback i Notes-listen, QR-panelet og neste naturlige notatflate. Utenfor scope er Content Manager som helhet, upload/recovery-logikk, related-note linking, API-er, database, auth, Stripe, analytics, tekst-/label-endringer og bred redesign.

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
| Product goals and IA                          | `target`     | The slice must stay inside `AdminContextNotesPanel` state rendering and keep the AW-006 canonical queue accurate after `#784/#785`.                                                    | active brief + canonical queue diff + changed-files review         | `5/5`                   |
| UX flow clarity                               | `target`     | Context notes warning, loading, load error+retry, action feedback, and empty states remain visible, specific, and recoverable where applicable.                                        | component diff + targeted tests + screenshot handoff               | `5/5`                   |
| Visual design quality                         | `target`     | Migrated states use the existing `AdminManagerState` visual contract and match the admin manager/context QR family without broad redesign or card/layout changes.                      | screenshot handoff + DOM/class review                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Notes fetches, category fetches, retry callbacks, create/update/delete payloads, attachment upload/recovery, related-note links, inherited module notes, and sorting remain unchanged. | targeted component tests + diff review                             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins still see clear refresh/retry/action feedback and empty guidance while managing contextual notes in the content editor.                                                         | context notes tests + screenshot handoff                           | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Dynamic loading/action feedback uses polite status semantics, recoverable load errors remain announced, and static empty state is not a noisy live region.                             | component tests for roles/aria + screenshot/manual review          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/admin` adds no dependency, no new fetch path, no repeated render loop, and no material payload increase beyond reuse of the existing helper.                        | package diff + build/pre-pr gate                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI rendering cleanup introduces no new local-only, server-canonical, browser storage, sync, conflict, retention, or sensitive-data behavior.                          | data contract section                                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                          | cache scope rationale                                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable load errors keep retry wired to the same loader; empty state remains deterministic from existing arrays; mutation feedback continues to render near the panel.             | component tests for retry, empty, and action feedback              | `5/5`                   |
| Security and authz                            | `target`     | Protected admin notes API routes, credentials mode, authz boundaries, request inputs, secrets, cookies, and roles remain untouched.                                                    | unchanged API-route diff review + targeted component tests         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                    | privacy scope rationale                                            | `N/A`                   |
| Content governance                            | `target`     | Existing contextual notes copy and queue/documentation source of truth are preserved or explicitly updated for this slice only.                                                        | copy-preservation diff review + docs update                        | `5/5`                   |
| Admin workflow and editability                | `target`     | Quick note, create, edit, done/reopen, delete, attachment, upload recovery, and related-note actions keep existing labels, disabled states, and recovery behavior.                     | context notes tests + screenshot handoff                           | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                      | SEO scope rationale                                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                    | AI-discoverability scope rationale                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy or payload changes; existing admin notes actions continue to use current fetch/mutation behavior.                                         | diff review                                                        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches contextual admin notes state rendering only and changes no Stripe identifiers, pricing, entitlements, checkout, invoices, refunds, payouts, or revenue data.  | explicit commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                          | explicit support-ops scope rationale                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                               | explicit finance scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin notes strings may later become locale-sensitive, but this slice preserves existing English admin strings and changes no translation workflow.                 | copy-preservation diff review                                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `AdminManagerState` helper inside `components/admin/`, existing Tailwind/admin classes, and no new dependency or app-wide primitive.                                | component diff + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for migrated contextual notes states; run targeted tests, brief lint, and required broad gates after screenshot approval.                               | targeted test commands + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the parity pass reduces repeated admin UI markup without adding runtime services, infrastructure, or recurring cost.                                                | helper reuse across one bounded context notes surface              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                              | git diff review + validation gates                                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the migrated admin manager family recorded in `docs/design/notice-empty-state-pattern-inventory.md`, especially `AdminContextQrPanel`, `AdminNotesManager`, `AdminQrLinksManager`, `AdminCategoriesManager`, and `AdminMessagesManager`.
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminContextNotesPanel.tsx`; do not move fetches, mutations, route boundaries, editor placement, or server/client ownership.
  - Route/action/API boundary: `/api/admin/notes`, `/api/admin/notes/[id]`, note attachment routes, related-note routes, category support fetches, and admin auth boundaries remain unchanged.
  - Cache/revalidation: no cache, `cache: "no-store"`, refresh, or invalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve current response types, form state, edit state, note row type, mutation payloads, context key handling, inherited module behavior, attachment recovery state, related-note link behavior, and fallback error strings.
  - Deterministic invariants: loading renders only while loading, load error renders only when not loading, retry invokes the same loader, empty derives from `items.length`, and action feedback derives from existing mutation/copy/upload outcomes.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Use the existing admin-local helper and AW-006 state-color direction.
  - Keep the primitive admin-local; this is one bounded high-value surface parity pass, not a shared app-wide design-system rollout.
  - Screenshot handoff comparison type: `after/reference`, comparing migrated Context Notes states to already-migrated Context QR/Admin Notes reference states where practical.
- Testing:
  - Add focused unit/component tests for Context Notes loading, warning, load error+retry, action feedback, and empty state.
  - Run screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this UI rendering cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Notes, attachments, related notes, categories, and contextual refs remain server-canonical through existing admin API routes; the component only renders already-derived component state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing note IDs, titles, categories, context refs, attachment IDs, and related-note IDs are not changed.

## Help / Guide Impact

N/A with rationale: this slice preserves existing admin workflow labels, recovery action labels, copy, support procedures, Help/Guide assertions, and the Admin Notes recovery runbook. Help/Guide or runbook updates are required only if implementation changes operator workflow labels, action meaning, recovery behavior, auth, payments, or support procedure; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin-surface sweep because this slice consolidates repeated operator-facing state rendering without changing labels or workflow actions.

- Terms to sweep before broad gates:
  - `Loading notes`
  - `Could not load context notes`
  - `No admin notes attached yet`
  - `Retry`
  - `actionError`
  - `actionNotice`
  - `role="status"`
  - `role="alert"`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/AdminContextNotesPanel.tsx`
  - `components/admin/AdminManagerState.tsx`
  - `tests/unit/admin-context-notes-panel.test.tsx`
  - `tests/e2e/admin-contextual-notes.spec.ts`
  - `components/admin/AdminHelpCenter.tsx`
  - `docs/runbooks/admin-notes-recovery.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - Context Notes panel states reuse the existing admin-local helper,
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint updates,
  - canonical AW-006 queue update,
  - no Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Migrate these state renderings in `components/admin/AdminContextNotesPanel.tsx` to `AdminManagerState`:
  - schema warning,
  - contextual loading,
  - contextual load error + retry,
  - action error,
  - action notice,
  - empty attached-notes state.
- Add focused unit/component tests under `tests/unit/admin-context-notes-panel.test.tsx`.
- Update this active brief, the canonical AW-006 queue, and the design inventory where needed.
- Capture screenshot handoff artifacts for the changed admin UI before PR gates.

## Out Of Scope

- Broad app-wide Notice/EmptyState primitives.
- New or changed `AdminManagerState` API unless a tiny compatibility adjustment is required by Context Notes.
- `AdminNotesManager`.
- `AdminContentManager` outside the embedded Context Notes render.
- Attachment upload or staged image recovery behavior changes.
- Related-note link behavior changes.
- Admin notes API changes.
- Admin notes copy or workflow label changes.
- Admin content editor redesign.
- Auth sign-in feedback, contact form feedback, My Library notice behavior, guide sync/offline states, dryland/micro-session states, Poolside export states, public visual redesign, or note API behavior.
- Admin API behavior, authz, Supabase schema/RLS, Stripe/commerce truth, email delivery, analytics, entitlement logic, checkout, migrations, generated DB types, workflows, package dependencies, environment variables, secrets, or merge to `main`.

## Acceptance Criteria

1. `AdminContextNotesPanel` uses the existing `AdminManagerState` helper for the scoped feedback/list-state renderings while preserving copy, callbacks, fetches, mutations, attachment recovery, inherited module notes, and related-note behavior.
2. Accessibility semantics are explicit: dynamic status/action feedback uses polite status semantics, recoverable errors remain announced, and static empty state is not a live region.
3. Focused tests cover loading, warning, load error+retry, action feedback, and empty notes behavior.
4. Screenshot handoff includes `after/reference` artifacts for representative changed Context Notes states before `npm run verify:pre-pr`.
5. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-context-notes-panel.test.tsx tests/unit/admin-manager-state.test.tsx`: PASS, 2 files / 10 tests.
  - `npm run lint:briefs`: PASS, no tracked changed briefs found before staging; `npm run lint:briefs:all` was run to validate the new untracked active brief.
  - `npm run lint:briefs:all`: PASS, all 331 brief files including this active brief.
  - targeted route/label/support sweep: PASS, no Help/Guide or runbook update needed because labels and recovery behavior are unchanged.
  - `git diff --check`: PASS.
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture representative `after/reference` screenshots against `http://127.0.0.1:3000`
  - stop for owner screenshot approval before PR gates
  - Captured artifact folder: `output/aw-006-admin-context-notes-state-20260520214729`
  - Captured: `2026-05-20 21:47`
  - Comparison type: `after/reference`.
  - Required filenames captured:
    - `after-context-notes-empty-desktop.png`
    - `after-context-notes-load-error-desktop.png`
    - `after-context-notes-warning-mobile.png`
    - `reference-admin-notes-empty-desktop.png`
  - Known visual caveat: the load-error screenshot includes the existing viewer-role guidance because the mocked first load failure has no resolved admin role; this preserves current behavior and does not change labels or authz.
  - Capture note: screenshots used a temporary local development route rendering the production components with mocked browser API responses; the temporary route and capture script were removed before handoff. No committed product-rendering file changed after the final capture.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required CI
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server commands should use escalation-first strategy per repo instructions.

## Completion Record

- `completed`: `2026-05-20`
- `merged_pr`: `#786`
- `closeout_pr`: `#787`
- `merge_url`: `https://github.com/stianvikra/freeswimming/pull/786`
- `squash_commit`: `2fd8827`
- `closeout_commit`: `f45ac94`
- `implementation_commit`: `ae42ca4`
- `result`: Shipped the Admin Context Notes Panel state primitive parity slice by moving contextual warning, loading, load error+retry, action feedback, and empty attached-notes states to the existing `AdminManagerState` helper while preserving notes APIs, authz, attachments, related-note behavior, labels, and support procedures.
- `10/10 claim`: yes - all critical target categories scored `5/5` for this bounded UI parity slice.

Plain-language done summary:

- The admin content editor now shows Context Notes loading, error, retry, action feedback, and empty states with the same admin-local treatment as the surrounding notes and QR admin surfaces.
- The change was scoped to presentation of existing states; note data, permissions, attachments, links, and workflow labels were preserved.

Validation evidence:

- Targeted component tests for Context Notes and `AdminManagerState`: pass during PR `#786`.
- `npm run verify:pre-pr`: pass before PR update.
- Required CI for PR `#786`: pass before merge.
- `npm run verify:pre-merge`: pass before merge readiness.
- Screenshot handoff was approved before broad gates; no product-rendering file changed after the final capture.

Risk and rollback:

- Runtime risk was bounded to admin Context Notes state rendering.
- Rollback is a normal revert of `2fd8827`; no migration, config, package, workflow, provider, or environment rollback is required.

Critical target categories confirmed `5/5`:

- UX flow clarity
- Business logic correctness and data integrity
- Reliability and failure handling
- Security and authz
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Achieved Score | Evidence                                                                                                                    | Gaps / Notes                                      |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#786` stayed inside Context Notes state rendering and closeout PR `#787` moved this brief to `done`.                    | Queue stale-reference repair handled separately.  |
| UX flow clarity                               | `5/5`          | Warning, loading, error+retry, action feedback, and empty states use the shared admin-local helper.                         | None for this slice.                              |
| Visual design quality                         | `5/5`          | Screenshot handoff compared migrated Context Notes states to admin references and was approved before broad gates.          | None for this slice.                              |
| Business logic correctness and data integrity | `5/5`          | Targeted tests and diff review preserved fetches, retries, mutations, attachments, inherited notes, and related-note links. | None for this slice.                              |
| Admin editor ergonomics                       | `5/5`          | Contextual notes feedback remains visible and recoverable inside the content editor.                                        | None for this slice.                              |
| Accessibility (a11y)                          | `5/5`          | Tests covered status/alert semantics and kept static empty state out of live regions.                                       | None for this slice.                              |
| Reliability and failure handling              | `5/5`          | Retry stayed wired to the same loader and empty state stayed deterministic from existing arrays.                            | None for this slice.                              |
| Security and authz                            | `5/5`          | Protected admin routes, credentials mode, role checks, request inputs, secrets, and cookies were untouched.                 | None for this slice.                              |
| Content governance                            | `5/5`          | Existing admin notes copy was preserved and lifecycle docs were updated through `#786/#787`.                                | Separate repair PR fixes stale active queue text. |
| Admin workflow and editability                | `5/5`          | Quick note, edit, done/reopen, delete, attachment, upload recovery, and related-note labels/behavior were preserved.        | None for this slice.                              |
| Stack-fit and dependency discipline           | `5/5`          | Reused `AdminManagerState`; no dependency or app-wide primitive was added.                                                  | None for this slice.                              |
| Testing and QA automation                     | `5/5`          | Targeted tests, screenshot gate, pre-PR gate, CI, and pre-merge gate passed.                                                | None for this slice.                              |
| DevOps and rollback readiness                 | `5/5`          | PR `#786` merged as `2fd8827`; closeout PR `#787` merged as `f45ac94`; rollback is a normal git revert.                     | No migration or provider rollback needed.         |

Remaining gaps: none for this scoped Context Notes state primitive parity slice.

Defer/fix recommendation: none; all target categories are `5/5`.

## Checkpoint Log

- `2026-05-20 | in-progress | started from clean main@803aafe after PR #784 and repo-managed closeout #785; post-merge preflight found no pending closeout; created branch aw-006-admin-context-notes-state-parity and active brief for the Context Notes state primitive parity slice | next: migrate AdminContextNotesPanel state renderings to AdminManagerState, refresh the AW-006 queue/design inventory, and add targeted tests`
- `2026-05-20 | in-progress | migrated contextual warning/loading/load-error/action/empty states to AdminManagerState, added focused unit coverage, updated AW-006 queue and design inventory, passed targeted tests/lint/sweep/diff-check, and captured screenshot artifacts at output/aw-006-admin-context-notes-state-20260520214729 | next: wait for owner screenshot approval before running npm run verify:pre-pr`
- `2026-05-20 | PR #786 | owner approved screenshot handoff; committed ae42ca4, passed full npm run verify:pre-pr locally, pushed branch aw-006-admin-context-notes-state-parity, and opened PR #786 | next: monitor required CI, run npm run verify:pre-merge on the final PR head, then summarize merge readiness without merging`
- `2026-05-20 | done | PR #786 merged as main@2fd8827 and repo-managed closeout PR #787 moved this brief to done as main@f45ac94 | next: repair stale active/current queue and design-inventory references before selecting the next AW-006 UI slice`
