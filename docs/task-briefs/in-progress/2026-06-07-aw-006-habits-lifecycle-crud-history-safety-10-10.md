# Task Brief: AW-006 Habits Lifecycle CRUD And History Safety (10/10)

## Metadata

- `id`: `2026-06-07-aw-006-habits-lifecycle-crud-history-safety-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-07`
- `updated`: `2026-06-07`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `owner said kjor; implementation active on branch aw-006-habits-lifecycle-crud-history-safety`
- `target_findings`: `H-047`
- `planned_resolved_findings`: Broader habit edit/end/history/restore lifecycle rules plus explicit hard-delete deferral.
- `deferred_findings`: `H-028` midnight auto-complete, `H-046` Micro Sessions/Habits linkage, hard delete/permanent habit deletion, reminders, notification APIs, server/global sound preferences, user-selected sounds, exports, broad graphs/dashboard work, persistent Micro Sessions timer telemetry, and global calendar storage remain out of scope.
- `return_checkpoint`: update the Habits parent before this child is considered closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-07`
- `base`: clean synced `main@5cccfbf6`
- `audit_status`: `in-progress`
- `decision`: Implement this as the selected Habits Child N after the owner said kjor.
- `reason`: PR `#1009/#1010` closed server-canonical reset stats, PR `#1011/#1012` closed the latest Habits motivation polish, and the fresh scope audit found no active Habits child. The next highest-trust Habits gap is broader lifecycle safety: how users edit, end, and restore habits without corrupting history, reset boundaries, Calendar comparison, or motivation stats. Permanent deletion is intentionally deferred from the first implementation slice.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, the Habits parent, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, `lib/habits/schema.ts`, habits API/storage contracts, Supabase migrations/RLS/generated types, reset event contracts, My Library Calendar contracts, Help/Guide/support docs, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Define and later implement a safe Habits lifecycle workflow so users can edit, end, and restore habits without losing or miscounting history, reset boundaries, or motivation stats. Permanent deletion is a separate later decision, not part of the first implementation.

## Pre-Implementation Owner Explanation

Vi lager en trygg plan for hva som skal skje naar en bruker vil endre, avslutte eller hente tilbake en vane.

Hvorfor det betyr noe: Habits har naa historikk og reset-data. Da maa opprydding i gamle vaner vaere tydelig, slik at brukeren ikke mister tillit til streaks, kalender, reset-grenser eller gamle logger.

Utenfor scope er permanent sletting, reminders, grafer, eksport, nye lydinnstillinger, automatisk Micro Sessions-kobling og midnight auto-complete.

Fremoverkompatibilitet: nye habit-typer, statuser og lifecycle-handlinger maa enten folge disse reglene automatisk gjennom typed contracts, eller kreve eksplisitt mapping med tester foer de kan paavirke historikk eller motivasjonstall. Permanent sletting krever egen mapping og eierbeslutning senere.

## Product Decisions To Validate Before Execution

- `End habit and move to Past habits` is the safe non-destructive default for stopping a habit.
- Ending a habit preserves check-ins, reset events, Calendar comparison markers, and support diagnostics.
- Restoring a habit must be explicit and must say whether it continues the same habit identity or creates a fresh habit.
- Editing a habit in place is allowed only when the underlying routine is still the same habit.
- Materially repurposing a habit, for example changing `Drink water` into `Read pages`, should create a new habit or require explicit warning because old history would otherwise attach to the wrong behavior.
- Hard delete is out of the first implementation. The first implementation may only ship non-destructive cleanup through `End habit`, `History/Past habits`, and `Restore`.
- Any future hard-delete path needs a separate child brief, destructive confirmation, owner-scoped authorization, deterministic data impact, migration/rollback plan, and support/runbook coverage.
- Reset stats is not delete. Reset boundaries stay attached to the same habit identity unless the habit is deliberately replaced by a new row.
- Unknown lifecycle states must fail closed and must not improve streak, perfect-day, days-completed, or consistency metrics.

## Scope

- Audit existing Habits edit/archive/history behavior and define the safe lifecycle contract.
- Add or update active habit edit behavior only where it preserves existing identity, history, and reset boundaries.
- Add or update the ended/archive/history surface so ended habits can be understood and, if product-safe, restored.
- Add a safe delete policy that explicitly defers permanent deletion; do not add hard-delete UI/API mutation behavior in the first implementation.
- Preserve existing check-ins, reset events, and Calendar comparison meaning; any future destructive path needs a separate owner-approved brief.
- Add deterministic support diagnostics for active, ended, restored, and unknown lifecycle states without exposing private habit names or notes.
- Update Help/Guide/runbooks when user-facing labels, recovery behavior, or support diagnosis changes.
- Add targeted unit, component, route/API, e2e, and screenshot coverage for changed lifecycle states and negative authz paths.

## Out Of Scope

- Midnight auto-complete or automatic day-boundary check-ins.
- Reminders, notification APIs, server-stored preferences, global sound settings, or user-selected/uploaded sounds.
- Micro Sessions habit auto-creation, Perfect Day linkage, or `Create habit from micro session`.
- Export reports, broad graphs/dashboard work, global calendar storage, month/year heatmaps, or work/off-work filters.
- Changing timer/manual source persistence from Child I.
- Changing reset stats semantics from Child K except to preserve lifecycle compatibility.
- New habit modes, new check-in statuses, or new reset event types unless execution audit proves they are required for lifecycle safety and the owner approves the mapping.
- Hard delete, permanent habit deletion, permanent tombstone schema, or irreversible data removal.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Active habits expose safe edit/end actions with clear labels and no ambiguous destructive path.
2. Ended habits remain visible in History/Past habits with enough context to trust what happened.
3. Restore behavior is explicit: same identity continuation vs new habit identity is clear and tested.
4. Editing a habit preserves history only when it is the same underlying habit; repurpose risk is blocked or warned.
5. Permanent delete is explicitly not shipped; user-visible cleanup is `End habit`, `History/Past habits`, and `Restore`, with hard delete deferred to a follow-up decision.
6. Historical check-ins and reset events are not silently deleted, rewritten, or rebound to the wrong habit.
7. Motivation stats, Perfect Day, Calendar comparison, and reset markers treat ended/restored states deterministically.
8. Unauthorized users cannot edit, end, or restore another owner habit.
9. Failed lifecycle mutations leave existing data and displayed stats unchanged.
10. Unknown lifecycle states fail closed and do not award success, streak, perfect-day, or consistency credit.
11. Help/Guide or support runbooks explain lifecycle labels, recovery behavior, hard-delete deferral, and privacy-safe diagnostics.
12. Screenshot handoff proves active edit/end, ended history, restore confirmation, hard-delete deferral/no destructive affordance, failure state, and mobile/desktop layout before `verify:pre-pr`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Business logic correctness and data integrity`
- `Security and authz`
- `Reliability and failure handling`
- `Data placement and sync boundaries`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | User can understand active, ended, restored, and hard-delete-deferred habit states from `/my-library/habits` without dead ends.                                           | component/e2e tests + screenshot handoff         | `5/5`                   |
| UX flow clarity                               | `target`     | Primary actions are explicit, permanent deletion is absent/deferred, and recovery/failure states are visible near the action.                                             | component/e2e tests + visual QA                  | `5/5`                   |
| Visual design quality                         | `target`     | Changed Habits Details/History/confirmation UI matches current AW-006 token/card/action language on mobile and desktop.                                                   | screenshot handoff                               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Lifecycle transitions preserve canonical habit/check-in/reset data with deterministic invariants and no silent history corruption or irreversible deletion.               | unit/domain/API tests                            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes member Habits lifecycle only, not admin editor CRUD, publish workflow, or operator content editing.                                        | explicit admin-editor scope rationale            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Changed controls, dialogs, status messages, and lifecycle confirmations are keyboard operable with labels, focus visibility, and aria-live where needed.                  | component/e2e accessibility assertions           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: avoid new dependencies and no material `/my-library/habits` client payload growth; route remains within existing private-route performance expectations. | build/perf budget output + dependency diff       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Active/ended/restored state ownership is server-canonical; transient dialogs are local-only; sync and failed mutations are explicitly defined.                            | data contract + route/API tests                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Successful lifecycle mutations refresh Habits and Calendar comparison reads deterministically; failed mutations do not invalidate into false success.                     | route/API tests + cache notes                    | `5/5`                   |
| Reliability and failure handling              | `target`     | Latency, failed mutation, stale state, and unknown lifecycle values show deterministic recovery without corrupting displayed metrics.                                     | negative-path unit/component/e2e tests           | `5/5`                   |
| Security and authz                            | `target`     | All lifecycle mutations fail closed for unauthenticated/cross-owner access with deterministic `401/403` or safe validation errors.                                        | API negative-path tests                          | `5/5`                   |
| Privacy and compliance                        | `target`     | Habit names, notes, quit/slip details, and lifecycle reasons are not leaked in logs, support copy, analytics, or public surfaces.                                         | payload/log review + support docs                | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: Help/Guide/runbook wording must match changed labels and lifecycle meaning; no public content model changes.                                             | docs/runbook sweep                               | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, admin actions, admin recovery path, or operator editability surface.                                                   | explicit admin-workflow scope rationale          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this slice changes no public metadata, sitemap, robots, canonical URL, or structured data.                  | private-route SEO rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no crawl-safe public entity, structured data, AI-facing docs, or public page copy.                                                         | AI-discoverability scope rationale               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: if lifecycle events already exist, preserve safe payload shape; any new analytics value requires explicit mapping and PII review.                        | route/label/support sweep + payload review       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, billing portal, refund, invoice, payout, or revenue flow.                                             | commerce scope rationale                         | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose lifecycle state using redacted IDs/dates/statuses and clear runbook language without private habit contents.                                         | support runbook update + negative-path evidence  | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoices, refunds, payouts, entitlements, revenue report, reconciliation surface, or finance operation.  | explicit finance scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Lifecycle labels and confirmations avoid tight layout assumptions and define future explicit mapping for translated labels/statuses.                                      | screenshot handoff + forward-compatibility notes | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Habits server/domain helpers, route boundaries, tokens, and tests before adding abstractions; no new dependency unless owner-approved.                     | code review + dependency diff                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/domain/API/component/e2e coverage covers lifecycle transitions, failure paths, cross-owner denial, and unknown status fallback.                                      | targeted tests + `verify:pre-pr`                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: lifecycle state queries must avoid obvious N+1 patterns and unnecessary event bloat as habit history grows.                                              | query/code review                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Any migration has explicit rollback/deploy order; no irreversible destructive behavior ships in this first implementation slice.                                          | migration/rollback notes + pre-merge gate        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `/my-library/habits` and `HabitPerfectDayHub` as the reference surface.
  - Preserve authenticated App Router boundaries and existing route refresh behavior unless implementation audit proves a focused change is required.
  - Keep confirmation dialogs and lifecycle feedback close to the habit row/action that triggered them.
- TypeScript/domain contracts:
  - Audit `HabitDefinitionView`, `HabitCheckInView`, reset event types, cadence helpers, and summary helpers before lifecycle behavior changes.
  - Add typed lifecycle states/actions instead of route-local string checks.
  - Define deterministic invariants for edit/end/restore and unknown values.
- Supabase/data layer:
  - If persisted lifecycle state changes, use explicit migrations, RLS/authz review, generated DB type updates, indexes where needed, and negative-path tests.
  - Prefer reversible lifecycle state for ended/restored behavior; permanent deletion remains a separate owner-approved follow-up.
- External services/tools:
  - N/A; do not add external services, SDKs, notifications, analytics vendors, or native integrations for this slice.
- UI system:
  - Reuse existing My Library/Habits token/action classes, `fs-cta-*`, `fs-library-card`, and current confirmation/action hierarchy.
  - UI changes require screenshot handoff; comparison type should be `before/after` when the same surface exists before execution.
- Testing:
  - Domain/unit tests for lifecycle transitions and metric derivation.
  - Route/API tests for validation, authz, and failure paths.
  - Component tests for labels, confirmation, status feedback, and accessible controls.
  - Playwright/screenshot handoff for mobile and desktop changed surfaces.

## Data Placement And Sync Contract

- Server-canonical data:
  - habit definitions and stable habit IDs;
  - habit check-ins;
  - reset events;
  - lifecycle status/state such as active, ended/archived, and restored.
- Local data:
  - open dialogs, confirmation text state, pending button state, and transient success/error feedback.
  - no local-only lifecycle truth.
- Sync policy:
  - lifecycle mutations are explicit writes and treat the server response as source of truth.
  - after success, refresh the Habits snapshot and any Calendar comparison data affected by the lifecycle state.
  - failed mutation must preserve prior data and must not play success feedback or update durable stats.
  - stale write conflicts must reload canonical habit state before retry.
- Retention and sensitivity:
  - habit lifecycle state is private member data.
  - permanent deletion/tombstone behavior is deferred; any future implementation must state retention and support diagnosis expectations before implementation.
  - logs/support diagnostics use redacted habit IDs, dates, lifecycle status, and error class only.
- Cache/invalidation:
  - preserve existing `/my-library/habits` freshness model unless audited otherwise.
  - mutation success invalidates the affected habit row, Motivation stats, Past habits/History section, and Calendar comparison marker/read path.

## Identity And Rename Contract

- Canonical stable ID:
  - existing habit ID remains the identity for check-ins, reset events, lifecycle state, History/Past habits, Calendar markers, support diagnostics, and future exports.
- Human-readable identifiers:
  - habit title is display-only and renameable.
  - lifecycle labels are display copy and must not become storage keys.
- Mutability rules:
  - same-habit edits preserve ID and history.
  - ended/restored state preserves ID unless user chooses a new habit identity.
  - first implementation must not remove the ID; any future hard delete or tombstone state must define whether the ID remains readable for support/history.
- Rename vs repurpose:
  - rename in place only when the real-world habit remains the same.
  - material repurpose should create a new habit or require explicit user warning that history remains attached.
- Compatibility contract:
  - legacy archived habits render safely as ended/history records.
  - habits without lifecycle status default to active or existing archived behavior based on current canonical fields.
  - unknown lifecycle values fail closed and do not count as active completion.
- Observability and repair:
  - invalid lifecycle rows should be detectable through support-safe IDs/status/date, ignored for positive metrics, and recoverable through a documented support path.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit lifecycle states, habit actions, habit modes, cadence values, reset event types, Calendar marker meanings, support labels, analytics payloads, export fields, and future locale strings.
- Source of truth:
  - lifecycle state must derive from server-canonical habit data or typed lifecycle events, not title text, UI copy, or localStorage.
- Additive behavior:
  - future habit titles/categories inherit the same edit/end/history layout.
  - future supported modes/units keep lifecycle rules if they use existing typed contracts.
  - new ended/restored rows appear in History/Past habits through the shared view-model contract.
- Explicit mapping requirements:
  - new lifecycle states, destructive actions, deletion policies, reset interactions, Calendar marker styles, export meanings, analytics event values, support labels, and locales require code/copy/test/docs mapping.
- Unknown or deprecated values:
  - unknown lifecycle values show safe generic copy, do not count as completed/active/perfect-day credit, and surface support-safe diagnostics.
  - deprecated labels remain aliases only if explicitly mapped.
- Test/evidence:
  - fixtures for active, edited, ended, restored, hard-delete-deferred/no destructive affordance, legacy archived, unknown lifecycle state, reset-before-end, reset-after-restore, and cross-owner denial.

## Help / Guide Impact

Required if implementation changes visible lifecycle labels, actions, recovery behavior, or support diagnostics:

- update `docs/user-flow-map.md` with Habits edit/end/restore meaning and hard-delete deferral;
- update `docs/runbooks/auth-account-support.md` with privacy-safe lifecycle troubleshooting;
- update Help/Guide only if admin/operator workflow labels or recovery behavior changes.

Because hard delete is intentionally not shipped in the first implementation, docs must say that the user-visible cleanup path is `End habit`, `History/Past habits`, and `Restore`.

## Route / Label / Support Surface Sweep

Required before broad gates:

Identifiers searched:

- `/my-library/habits`
- `/my-library/calendar`
- `HabitPerfectDayHub`
- `Edit this habit`
- `Archive this habit`
- `End habit and move to Past habits`
- `Past habits`
- `History`
- `Restore`
- `Delete`
- `Hard delete`
- `Permanent delete`
- `Reset habit stats`
- `Reset these habit stats`
- `Since`
- `Last stats restart`
- `habit_definitions`
- `habit_check_ins`
- `habit_stats_reset_events`
- `archived`
- `deleted`
- `restored`
- `source=habits`

Surfaces checked:

- `app/my-library/habits/page.tsx`
- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `lib/habits/shared.ts`
- `lib/habits/server.ts`
- `lib/habits/schema.ts`
- Habits API routes
- Supabase migrations/RLS/generated types if lifecycle persistence changes
- `lib/my-library/calendar.ts`
- `lib/my-library/calendar-comparison.ts`
- `tests/unit/habits.test.ts`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- relevant e2e/component tests
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- active/planned/done Habits task briefs, AW-006 queue, and design inventory.

## Validation

Required for this planned docs-only brief creation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`

Required before future implementation PR:

- targeted unit/domain/API/component tests for changed lifecycle behavior;
- API failure-mode evidence for this implementation must cover unsupported lifecycle status, cross-owner restore denial, active-limit restore denial, schema-missing safe response, controlled restore failure feedback, and no unexpected 500 success path;
- screenshot handoff and owner approval before `npm run verify:pre-pr`;
- `npm run verify:pre-pr`;
- required CI checks green;
- `npm run verify:pre-merge` before merge recommendation.

## Local Tooling Prerequisite

- Use the repo's normal Node/npm path.
- Before reporting npm/node missing, bootstrap with `nvm use --silent`.

## Manual QA Environments

Required for future implementation:

- local `http://127.0.0.1:3000/my-library/habits`;
- PR preview `/my-library/habits`;
- mobile and desktop screenshots for active Details, History/Past habits, restore confirmation, hard-delete deferral/no destructive affordance, and failure states.

## Constraints

- Keep changes minimal and scoped to Habits lifecycle.
- Preserve current Habits visual language unless the lifecycle UI needs a targeted safety improvement.
- Do not introduce new dependencies.
- Do not change unrelated My Library, Calendar, Dryland, Micro Sessions, Goals, exports, Stripe, auth, or admin workflows.
- Do not ship permanent hard delete/tombstone behavior in the first implementation. Any irreversible destructive behavior needs a separate child brief, tests, support docs, migration/rollback plan, and owner approval.

## Debugging And Handoff Contract

- For UI/layout issues, use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- For route, label, workflow action, Help/Guide, runbook, recovery, or support-surface changes, use `docs/runbooks/route-label-support-surface-impact-sweep.md` before broad gates.
- If screenshots contradict the claimed lifecycle fix, switch to a ranked hypothesis loop before patching further.
- Final implementation handoff must include the parent return target and lifecycle status for H-047.

## 10/10 Quality Bar

- UX clarity: users understand whether they are editing, ending, or restoring a habit, and understand that permanent deletion is deferred.
- UI clarity: one primary action per confirmation and no permanent-delete control in the first implementation.
- Accessibility: keyboard/focus/labels/status semantics for every changed control and dialog.
- Business logic: no silent history loss, no cross-owner mutation, no stale success state, no unknown-state metric credit.
- Performance: no new dependency and no material private-route payload growth.
- Release safety: migration and rollback plan if lifecycle persistence changes.

## Checkpoint Log

- `2026-06-07 | planned | owner confirmed Habits lifecycle/CRUD as the next scope after clean synced main@5cccfbf6 and post-#1011/#1012 audit; created this planned child for H-047 only, with no runtime implementation active | next: wait for explicit owner execute/build/implement/kjor before moving to in-progress and refreshing code/schema/test audit`
- `2026-06-07 | planned | tightened scope after brief quality audit: first implementation is non-destructive edit/end/history/restore only, with hard delete/permanent habit deletion deferred to a separate later owner decision | next: wait for explicit owner execute/build/implement/kjor before moving to in-progress`
- `2026-06-07 | in-progress | owner said "ok kjor pa"; moved brief to in-progress on branch aw-006-habits-lifecycle-crud-history-safety | next: refresh code/schema/test audit, implement non-destructive edit/end/history/restore lifecycle, run targeted validation, and stop at screenshot handoff for owner visual approval before verify:pre-pr`
- `2026-06-07 | in-progress | implemented non-destructive lifecycle through existing server-canonical habit_definitions.status: active status validation fails closed for unknown values, End habit now requires confirmation and archives without touching check-ins/resets, Past habits exposes confirmed Restore habit using the same habit ID/history, restore is owner-scoped and blocked at the active-habit limit, and Help/support docs describe hard-delete deferral | validation: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx PASS; npm run typecheck PASS; npm run lint:briefs PASS/no changed tracked brief detected; git diff --check PASS | next: run lint:briefs:all, route/label sweep, screenshot handoff, then stop for owner visual approval before verify:pre-pr`
- `2026-06-07 | in-progress | completed route/label/support sweep for End habit, Restore habit, Past habits, hard delete/permanent delete, unsupported statuses, and stale archived restore/edit deferrals; removed the stale current inventory deferral while leaving old PR-specific exclusions intact | validation: npm run lint:briefs:all PASS | next: capture screenshot handoff and stop for owner visual approval before verify:pre-pr`
- `2026-06-07 | screenshot-ready | captured after-only screenshot handoff at output/aw-006-habits-lifecycle-crud-history-safety-2026-06-07-220044 for desktop Details/End confirmation, desktop Past habits Restore/no-delete, mobile Restore confirmation, and mobile Restore failure; local auth-backed capture was blocked by Supabase egress guard, so screenshots used a temporary local HabitPerfectDayHub harness with deterministic snapshot data and the harness was removed before final validation | validation: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx PASS; npm run typecheck PASS; npm run lint:briefs:all PASS; git diff --check PASS | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-07 | in-progress | owner approved screenshot handoff and requested one label correction: use the Past habits wording instead of the old History wording for the End habit action; owner explicitly waived refreshed screenshots for this label-only follow-up | next: update UI/docs/tests label, run targeted validation, then npm run verify:pre-pr`
- `2026-06-07 | pre-pr-ready | completed owner-requested label correction to End habit and move to Past habits across UI, tests, user-flow, and support docs; route/label sweep confirms no old user-facing History wording remains and no Pause/Resume wording was introduced | validation: ./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx PASS; npm run typecheck PASS; npm run lint:briefs:all PASS; git diff --check PASS | next: run npm run verify:pre-pr`
- `2026-06-07 | pre-pr-pass | npm run verify:pre-pr PASS full lane on branch current with origin/main; validation included quality gates, eslint with one existing warning in ignored output capture helper, typecheck, 1415 unit tests, production build, performance budgets with hold recommendation, and Playwright 106 passed / 530 skipped where local auth-backed coverage skipped due the known Supabase/dev-login egress stub | evidence: artifacts/test-runs/20260607-223512/verify.log | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
