# Task Brief: AW-006 Habits Reset Stats Motivation Reset (10/10)

## Metadata

- `id`: `2026-06-06-aw-006-habits-reset-stats-motivation-reset-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-06`
- `updated`: `2026-06-07`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `active implementation; owner approved final copy/internal reset rename, waived refreshed screenshots for those final changes, and approved gates/merge on green validation`
- `target_findings`: `H-040`, `H-045`
- `planned_resolved_findings`: Habits per-habit motivation reset workflow, plus the bounded Motivation clarity cleanup needed to make reset understandable.
- `deferred_findings`: Midnight auto-complete, reminders, notification APIs, exported reset reports, broad analytics dashboard/graphs, restore/edit archived habits, broad habit CRUD, Micro Sessions habit linkage, and destructive history deletion remain out of scope unless a later owner-approved brief selects them.
- `return_checkpoint`: update the Habits parent before this child is considered closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-07`
- `base`: clean synced `main@16bae053`
- `audit_status`: `in-progress`
- `decision`: Execute Child K on branch `aw-006-habits-reset-stats-reset`; screenshot handoff was completed earlier and the owner later waived refreshed screenshots for final copy/internal reset rename before gates.
- `reason`: During screenshot review for Habits Advanced Motivation And History Depth, the owner selected a systemic future reset direction. After Child M shipped, the owner also selected a bounded Motivation clarity cleanup for the same reset slice: explain stat reset as restarting motivation stats, remove noisy timed-source pills from habit cards, make weekly done status styling consistent, remove the `More history` disclosure, keep `What counts?` full width, and show `Past habits` full width below `What counts?`. Reset remains a write-flow with database/API/Calendar/support impact, so runtime implementation must stay in its own child brief rather than a visual-only polish slice.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, the Habits parent, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habits API/storage contracts, Supabase migration/RLS rules, My Library Calendar contracts, support runbooks, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before execution.

## Goal

Add a safe per-habit `Reset these habit stats` workflow so users can restart motivation stats without deleting or rewriting historical Habits check-ins, while simplifying the Motivation surface around that reset concept.

## Pre-Implementation Owner Explanation

Vi planlegger en trygg `Reset these habit stats`-funksjon for Habits. Den skal la brukeren starte per-habit streak, days hit og consistency paa nytt for en enkelt vane, uten at gamle logger slettes.

Hvorfor det betyr noe: motivasjon kan trenge en ny start etter sykdom, pause eller endret rutine, men brukerens historikk maa fortsatt vaere bevart og forklarbar.

Samtidig rydder vi Motivation slik at brukeren ser de viktigste tallene og forklaringene uten ekstra historikk-knapper eller tekniske totaler.

Utenfor scope er hard sletting av historikk, account-wide reset, reminders, midnight auto-complete, eksport, restore/edit av arkiverte vaner, Micro Sessions habit-kobling og full dashboard-redesign/grafer.

Fremoverkompatibilitet: reset maa vaere en egen typed, server-canonical event/kontrakt som Calendar, support og fremtidige metrics kan lese. Nye reset-typer eller ukjente reset-grunner skal ikke endre streak/days-hit/consistency uten eksplisitt mapping, tester og dokumentasjon.

## Product Decision

- Use `Reset these habit stats`, not `Reset streak`, as the user-facing action label in habit Details.
- Use `Reset stats` as the confirmation primary action and `Confirm reset stats?` as the dialog title.
- Keep `reset_stats` as the internal reset event type/API concept for this slice so database, route, analytics, and Calendar mappings remain typed and stable.
- Explain stat reset as an action that `restarts motivation stats`, not as deletion or data cleanup.
- The action is per habit, not global.
- Old `habit_check_ins` stay intact.
- Motivation stats use the latest valid reset effective date as the lower bound.
- Default Motivation view shows current post-reset stats; history before the latest reset remains preserved and reviewable through Calendar Comparison/support context without a large pre-reset history box in the habit Details UI.
- Multiple resets must be deterministic: latest valid reset drives current stats, older reset periods remain explainable by dated boundaries, and none of them delete check-ins.
- Calendar Comparison may show a `Habit reset` marker, but must not treat reset as a completed check-in.
- Reset must be auditable and reversible enough for support; it must not be a silent overwrite of old metric truth.
- Reset explanation belongs where the action happens: Details plus confirmation dialog. `What counts?` should include only a short supporting rule that old check-ins stay saved and `Reset stats` restarts motivation stats from the selected date.
- Details should show `Last stats restart <date>` with a Calendar Comparison link for complete history instead of a large pre-reset history box.
- Per-habit Details progress should use four compact metric positions: current streak, best streak, consistency, and days hit.
- Habit action labels should be explicit in Details: `Undo complete`, `Edit this habit`, and `Archive this habit`.
- Remove the `More history` disclosure in Motivation; keep the main stats open.
- Keep `What counts?` as one full-width disclosure below the main Motivation stats.
- Show `Past habits` as a full-width section below `What counts?`.
- Explain `Rest days` and `Slips` in `What counts?`; do not show `Timed minutes` or `Count total` as top-level Motivation stats.
- Timed habit cards should show one clean progress line. Remove the compact `Timer`, `Manual`, and `Active` pills from the card; keep timer/manual source detail inside Details.
- Weekly target-met habits should use the same `Done this week` green status pill across timed/run and fixed habits, instead of mixing pill and inline progress text.

## Selected Architecture Direction

Future implementation should prefer an append-only reset event model:

- new server-canonical reset event row, for example `habit_motivation_resets`;
- owner-scoped `habit_id`;
- `effective_date`;
- optional typed reason enum or nullable note only if product-approved;
- `created_at` / `created_by` for audit;
- latest active reset event drives motivation windows;
- no mutation of historical check-ins;
- no local-only metric reset flag.

If implementation audit proves a column-based model is safer for the current schema, the brief must explicitly document why it still preserves auditability, Calendar markers, support diagnosis, and future multiple-reset behavior.

## Scope

- Add a per-habit `Reset these habit stats` workflow inside the habit Details surface.
- Add a confirmation flow that clearly says old logs stay saved and motivation stats restart from the selected effective date.
- Persist reset state in a server-canonical, owner-scoped, typed way.
- Recompute per-habit current streak, best streak, days hit, and consistency from the reset date forward.
- Keep totals and preserved history explainable before and after reset.
- Support repeated stat resets by preserving each reset boundary as dated history instead of overwriting the prior event.
- Add a visible `Since <date>` or equivalent label where reset affects motivation stats.
- Simplify the top-level Motivation surface for reset clarity:
  - remove the `More history` disclosure;
  - show the main Motivation stats open by default;
  - keep `What counts?` as one full-width disclosure below the main stats;
  - show `Past habits` full width below `What counts?`;
  - include `Rest days` and `Slips` as visible Motivation stats or clearly explained supporting values;
  - remove `Timed minutes` and `Count total` from top-level Motivation stats.
- Simplify timed habit cards:
  - remove compact `Timer`, `Manual`, and `Active` pills from the collapsed timed progress module;
  - keep saved timer/manual source details in Details where the user can inspect or edit them.
- Normalize weekly target-met status:
  - show `Done this week` as the same green status pill across timed/run and fixed weekly habits;
  - do not duplicate `Done this week` as inline progress text when the pill already communicates it.
- Add Calendar Comparison reset marker support only through explicit mapping from the reset contract.
- Update support docs/runbooks so operators can diagnose reset questions without private habit names or raw notes.
- Add unit, route/API, component, and screenshot coverage for reset creation, metric recomputation, Calendar marker mapping, and negative authz paths.

## Out Of Scope

- Deleting, truncating, rewriting, or anonymizing historical `habit_check_ins`.
- Account-wide reset across all habits.
- Reset for Calendar, Dryland, Micro Sessions, Swimming, goals, course progress, or exports.
- Midnight auto-complete, reminders, notification APIs, user-selected sounds, micro-session audio, restore/edit archived habits, broad analytics dashboard, or export downloads.
- New graphs, broad stats/dashboard redesign, export totals, or top-level aggregate `Timed minutes` / `Count total` Motivation cards.
- Changing timer/manual persistence semantics; this slice may move source-detail presentation into Details but must preserve the server contract from Child I.
- New habit modes, new check-in statuses, or new notes schema unless required for the reset event contract and explicitly owner-approved before execution.
- Merging without explicit owner approval.

## Acceptance Criteria

1. A user can reset stats for one active habit without affecting other habits.
2. Reset creates a server-canonical owner-scoped reset record and does not delete or rewrite historical check-ins.
3. Motivation stats show a clear reset boundary such as `Since Jun 6, 2026`.
4. Per-habit streak, best streak, days hit, and consistency derive from the reset boundary forward.
5. Preserved pre-reset history remains reviewable through Calendar Comparison/support context and is not counted as post-reset progress.
6. Multiple resets keep deterministic dated boundaries; the latest valid reset drives current Motivation stats and earlier periods remain explainable.
7. Calendar Comparison shows reset as a marker only, not as a done/rest/slip check-in.
8. Unauthorized users cannot create, read, or apply resets for another owner.
9. Support docs explain how to diagnose reset state using redacted owner-scoped IDs and dates.
10. Motivation no longer has a `More history` disclosure; main stats are open, `What counts?` is full width, and `Past habits` appears full width below `What counts?`.
11. `Rest days` and `Slips` remain explainable, while `Timed minutes` and `Count total` are not shown as top-level Motivation stats.
12. Timed habit cards no longer show compact `Timer`, `Manual`, or `Active` pills in the collapsed progress module; the source details remain available in Details.
13. Weekly target-met habits show one consistent `Done this week` green status pill across timed/run and fixed habits.
14. Screenshot handoff proves Details workflow, confirmation copy, post-reset summary, repeated-reset state, Motivation layout cleanup, timed-card cleanup, weekly status pill consistency, and mobile layout.

## Data Placement And Sync Contract

- Server-canonical data:
  - existing `habit_definitions`;
  - existing `habit_check_ins`;
  - new reset event contract selected during implementation audit;
  - stable habit IDs;
  - reset effective date and audit metadata.
- Local data:
  - confirmation modal open/closed state only;
  - no local-only reset truth;
  - no localStorage reset flag.
- Derived view-model:
  - motivation summary uses canonical check-ins plus the latest valid reset event for the habit.
  - raw history totals remain available separately from post-reset motivation stats.
  - top-level Motivation does not expose `Timed minutes` or `Count total` cards; those values may remain domain/support data or appear only where they are directly tied to a specific habit/details surface.
- Sync policy:
  - reset creation is a mutation with success/error feedback;
  - after success, refresh Habits snapshot and Calendar comparison data through existing route/cache boundaries;
  - failed reset must leave all metrics unchanged.
- Retention and sensitivity:
  - reset records are private owner data;
  - do not log habit names, raw notes, or private reasons;
  - support diagnostics use redacted `habit_id`, `reset_id`, `effective_date`, `created_at`, and status.
- Cache/invalidation:
  - preserve `/my-library/habits` dynamic/no-store behavior unless audited otherwise;
  - Calendar marker freshness must follow the same canonical server read path as Habits metrics.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID remains the identity for reset events, metrics, support repair, Calendar markers, and future exports.
- Human-readable identifiers:
  - habit title is display-only and renameable;
  - reset must never key off title text.
- Mutability:
  - reset event ID is immutable after creation;
  - effective date mutability must be explicit: either create a replacement event or support a typed update with audit.
- Rename vs repurpose:
  - renaming a habit preserves reset and history boundaries;
  - materially repurposing a habit should create a new habit if the user wants a clean identity.
- Compatibility:
  - legacy habits without reset events use full available history;
  - unknown reset event types or statuses fail closed and do not change metrics until mapped.
- Observability and repair:
  - invalid reset rows should be detectable through route tests/support probes and ignored fail-closed.

## Forward Compatibility Contract

- Automatically supported:
  - new supported check-ins after a reset;
  - renamed habit titles;
  - existing supported habit modes and units;
  - multiple future resets if the event model is implemented as append-only and latest-active event is selected deterministically.
- Requires explicit mapping:
  - new reset event types, statuses, reasons, undo policies, Calendar marker styles, export fields, analytics payloads, locales, or external integrations.
- Safe fallback:
  - missing reset means use existing full-history motivation behavior;
  - malformed or unauthorized reset means ignore the reset and show neutral/error feedback where appropriate;
  - unknown reset status must not improve streak, days hit, or consistency.
- Test/evidence:
  - fixtures must cover no reset, one reset, multiple resets, reset before first check-in, reset after archived date, unknown reset status, and cross-owner denial.

## Help / Guide Impact

Required:

- update `docs/user-flow-map.md` with `Reset these habit stats` behavior;
- update `docs/runbooks/auth-account-support.md` with reset diagnosis and privacy-safe support language;
- update Help/Guide only if future implementation exposes admin/operator workflow labels or recovery behavior.

## Route / Label / Support Surface Sweep

Required before broad gates:

- `/my-library/habits`
- `/my-library/calendar`
- `Reset these habit stats`
- `Reset stats`
- `Reset`
- `Since`
- `Last stats restart`
- `What counts?`
- `More history`
- `Habit reset`
- `Archived`
- `Past habits`
- `Rest days`
- `Slips`
- `Timed minutes`
- `Count total`
- `Timer`
- `Manual`
- `Active`
- `Done this week`
- `habit_check_ins`
- `habit_definitions`
- future reset table/contract name
- `habits_viewed`
- `source=habits`
- account export references if export wording changes

Execution evidence:

- identifiers searched: `start_fresh`, `start-fresh`, `Start fresh`, `Reset these habit stats`, `Reset stats`, `habit_stats_reset_created`, `reset_stats`, `habit_motivation_resets`, `More history`, `Before reset`, `Timed minutes`, `Count total`, `Timer`, `Manual`, `Active`, `Done this week`, `source=habits`, and the old planned brief path.
- surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `supabase/migrations/`, `types/database.ts`, `docs/`, `docs/runbooks/`, active/planned/done Habits task briefs, the AW-006 queue, design inventory, and user-flow map.
- fallout handled: old runtime/API/type names were removed, support docs now name `20260607143000_habits_stats_reset_events.sql`, Calendar reset markers are documented separately from completed habits, and the only remaining `start-fresh` strings are historical screenshot artifact folder names.

Required surfaces:

- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `lib/habits/shared.ts`
- `lib/habits/server.ts`
- `lib/habits/schema.ts`
- Habits API routes
- Supabase migrations/RLS/generated types if a persisted reset contract is added
- `lib/my-library/calendar.ts` and `lib/my-library/calendar-comparison.ts`
- `tests/unit/habits.test.ts`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- route/API tests for authz and reset validation
- Calendar tests if a marker mapping is added
- `docs/user-flow-map.md`
- `docs/runbooks/auth-account-support.md`
- Habits parent, AW-006 queue, and design inventory.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                          | Evidence                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `Reset these habit stats` must help motivation without deleting history, replacing check-ins, duplicating Calendar comparison, or crowding Motivation with low-value totals.                                                                | product copy + screenshots + route review                        | `5/5`                   |
| UX flow clarity                               | `target`     | User understands old logs stay saved, motivation stats restart from the selected date, reset is per habit, and `What counts?` explains the rules in one place.                                                                              | component tests + screenshot handoff                             | `5/5`                   |
| Visual design quality                         | `target`     | Details action, confirmation, reset boundary, `What counts?`, Past habits, timed-card progress, and `Done this week` pills fit existing Habits tokens without overflow.                                                                     | responsive screenshots + text-fit review                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Reset creates typed owner-scoped reset truth and recomputes motivation stats without modifying historical check-ins.                                                                                                                        | unit/integration/API tests + migration review                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface unless future execution revises scope.                                                                                            | explicit admin-editor scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Action, confirmation dialog, success/error feedback, reset labels, and Calendar marker are keyboard/screen-reader usable and not color-only.                                                                                                | component tests + screenshot/manual QA                           | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                                                                                     | component tests + screenshot/manual QA                           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: reset contract must not add heavy dashboards, polling, or unbounded client payloads.                                                                                                                                       | build/perf gate + diff review                                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Reset truth is server-canonical; local state is UI-only; failed reset leaves stats unchanged.                                                                                                                                               | data contract + route/API tests                                  | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Habits and Calendar views refresh deterministically after reset while preserving private no-store boundaries unless explicitly audited.                                                                                                     | route/server diff review + tests                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing, malformed, duplicate, unauthorized, or unknown reset rows fail closed and do not improve streak, days hit, or consistency. No unexpected 500 should expose private habit data; failure-mode responses return stable no-store JSON. | negative-path tests + support docs                               | `5/5`                   |
| Security and authz                            | `target`     | Reset APIs fail closed for unauthenticated/cross-owner requests and never expose another user's reset or habit data.                                                                                                                        | route/API negative-path tests                                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Habit names, notes, reasons, and private check-ins are not logged, public, or added to unsafe analytics payloads.                                                                                                                           | privacy/analytics diff review                                    | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, design inventory, user-flow docs, support docs, and child brief record reset behavior and deferred hard-delete/export scope.                                                                                                 | docs diff + `npm run lint:briefs`                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow labels, editable admin fields, role-gated CRUD, recovery action, or operator support action surface by default.                                                                                  | explicit admin-workflow scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.                                                                                    | private-route SEO rationale                                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no crawl-safe public entity model, public semantic page copy, structured data, or AI-facing public docs surface.                                                                                             | AI-discoverability scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: any future reset analytics must avoid habit names, notes, reasons, and raw private history values.                                                                                                                         | analytics diff review                                            | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                                                                                 | commerce scope rationale                                         | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs must explain how to diagnose reset questions with redacted reset/habit IDs and dates, plus what data remains preserved.                                                                                                        | support doc diff                                                 | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.                                                                                   | explicit finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels like `Reset these habit stats`, `Since`, `Last stats restart`, `What counts?`, `Past habits`, and `Done this week` must tolerate longer localized strings without layout breakage.                                                   | responsive screenshots + component assertions                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Habits domain helpers/server loader, existing UI primitives/tokens, Supabase migrations, and current test stack; add no dependency.                                                                                                   | code/dependency diff review                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests cover reset creation, stats recomputation, no-history deletion, Calendar marker mapping, cross-owner denial, unsupported reset status, Motivation layout cleanup, screenshots, and gates.                                             | unit/route/component/Calendar tests + broad gates                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration/API rollout must be reversible or forward-safe, with reset records ignored fail-closed if rollback removes UI access before data cleanup.                                                                                         | migration review + rollback notes + pre-merge gate               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: reset lookup must be indexed/bounded and not require full-history recomputation on every route beyond existing Habits history windows.                                                                                     | implementation/perf review + index/migration evidence if touched | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `HabitPerfectDayHub` Details surface and the active Habits snapshot contract;
  - keep mutation UI inside client component boundaries already used by Habits;
  - preserve private route/auth behavior.
- TypeScript/domain contracts:
  - add typed reset view-model helpers rather than route-local string matching;
  - recompute stats through deterministic helpers;
  - unknown reset values fail closed.
- Supabase/data layer:
  - use explicit migration and generated type updates if a reset table/column is added;
  - enforce owner-scoped RLS/authz;
  - add indexes for `owner_id`, `habit_id`, and `effective_date` as needed.
- External services/tools:
  - no external SDK/service is expected.
- UI system:
  - reuse existing Habits tokens, buttons, feedback, confirmation/dialog patterns, and mobile action layout;
  - keep Motivation stats open, `What counts?` full width, and `Past habits` full width below `What counts?`;
  - keep timed source details in Details instead of collapsed-card pills;
  - normalize `Done this week` status pill treatment across weekly habits;
  - screenshot handoff must be `before/after` or `after/reference`.
- Testing:
  - include domain, route/API, component, Calendar marker, negative authz, and screenshot evidence.

## Validation

Before future PR update:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run typecheck`
- targeted unit/domain tests for reset metric boundaries
- targeted route/API tests for reset mutation/authz
- targeted component tests for Details/confirmation UI, Motivation layout cleanup, timed-card source-pill removal, and weekly done status consistency
- Calendar tests if reset marker mapping is implemented
- route/label/support sweep from this brief
- screenshot handoff and owner visual approval before `npm run verify:pre-pr`
- `npm run verify:pre-pr`

Before future merge:

- required CI checks green
- `npm run verify:pre-merge`

## Screenshot Requirements

Required because future execution changes visible Habits UI and Calendar marker UI.

Handoff must include:

- habit Details before/after or after/reference for `Reset these habit stats`;
- confirmation dialog;
- post-reset stats boundary label;
- Motivation layout after cleanup, including open stats, full-width `What counts?`, full-width `Past habits`, no `More history`, and no top-level `Timed minutes` / `Count total`;
- timed habit card after cleanup, with no collapsed `Timer`, `Manual`, or `Active` pills and source detail still in Details;
- weekly target-met comparison showing `Done this week` as the same green pill across timed/run and fixed habits;
- Calendar marker if implemented in the same PR;
- mobile and desktop screenshots;
- clickable `Screenshot artifacts` folder link and `Captured: YYYY-MM-DD HH:MM`.

## Checkpoint Log

- `2026-06-06 | planned | created as systemic follow-up from owner screenshot review during active Habits Advanced Motivation And History Depth slice; reset/reset-stats is intentionally not implemented in the active read-only PR because it requires server-canonical write, Calendar marker, support, migration/RLS/authz, and screenshot coverage | next: keep planned until owner explicitly selects this child for execution`
- `2026-06-07 | planned refresh | owner confirmed Child K should also include bounded Motivation clarity cleanup: describe stat reset as restarting motivation stats, remove collapsed timed-source pills, normalize Done this week as a green pill, remove More history, keep What counts full width, show Past habits full width below What counts, explain Rest days/Slips, and remove Timed minutes/Count total from top-level Motivation | next: keep planned until owner explicitly selects this child for execution`
- `2026-06-07 | in-progress | owner said "kjor Child K"; moved brief to in-progress on branch aw-006-habits-reset-stats-reset, with screenshot approval stop active before verify:pre-pr, PR creation, or pre-merge gates | next: implement scoped reset contract, Habits UI cleanup, tests, docs, and screenshot handoff`
- `2026-06-07 | in-progress | implemented draft reset migration/API/domain/view-models, Habits Details confirmation, Motivation cleanup, Calendar reset marker mapping, support docs, parent/queue/inventory lifecycle updates, and targeted unit/component tests | next: run targeted validation, fix failures, then capture screenshot handoff`
- `2026-06-07 | owner-review | targeted validation passed: npm exec vitest -- run tests/unit/analytics-events.test.ts tests/unit/habits.test.ts tests/unit/habits-server.test.ts tests/unit/habits-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts (6 files/117 tests), npm run typecheck, npm run lint:briefs, npm run lint:briefs:all, git diff --check, and route/label/support sweep; screenshot artifacts captured in output/aw-006-habits-start-fresh-reset-2026-06-07-154048 using a temporary fixture route because local dev-login returned 500, then the fixture route was removed from the diff | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-07 | owner-review-corrections | owner requested Details polish before approval: move days hit into the fourth per-habit progress metric cell, replace the large pre-reset history box with Last stats restart + Calendar Comparison link, clarify reset confirmation copy, rename Undo/Edit/Archive actions to Undo complete/Edit this habit/Archive this habit | next: implement corrections, rerun targeted validation, refresh screenshot handoff`
- `2026-06-07 | owner-review-corrections-ready | corrections implemented; targeted validation passed: npm exec vitest -- run tests/unit/habit-perfect-day-hub.test.tsx (1 file/64 tests), npm exec vitest -- run tests/unit/analytics-events.test.ts tests/unit/habits.test.ts tests/unit/habits-server.test.ts tests/unit/habits-routes.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts (6 files/117 tests), npm run typecheck, npm run lint:briefs:all, and git diff --check; refreshed screenshot artifacts captured in output/aw-006-habits-start-fresh-reset-2026-06-07-162131 using a temporary fixture route because local dev-login returned 500 earlier, then the fixture route was removed from the diff | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-07 | owner-copy-final | owner requested no new screenshots and final copy change: Details action `Reset these habit stats`, confirmation title `Confirm reset stats?`, confirmation primary `Reset stats`; owner approved executing tests and merging on green gates | next: run targeted validation, verify:pre-pr, PR/CI, verify:pre-merge, merge if green`
- `2026-06-07 | pre-pr-ready | linked Supabase migration 20260607143000_habits_stats_reset_events.sql was applied after the first pre-PR drift check; targeted validation passed again with 6 files/120 tests, npm run typecheck, npm run lint:briefs:all, git diff --check, and npm run verify:pre-pr full lane passed with quality gate, lint, typecheck, 230 unit files/1408 tests, build, perf budgets, and e2e 106 passed/530 skipped | next: commit, push, open PR, monitor CI, run verify:pre-merge, and merge on green`
- `2026-06-07 | merged | PR #1009 shipped as squash commit 73f77c50 after CI required checks and npm run verify:pre-merge passed; post-merge preflight requested repo-managed docs-only closeout | next: move this brief to done, add Completion Record, update queue/inventory active references, run closeout gates, and merge closeout if green`

## Completion Record

- `completed`: `2026-06-07`
- `merged_pr`: `#1009`
- `squash_commit`: `73f77c50`
- `result`: Closed AW-006 Habits Reset Stats Motivation Reset. Users can reset motivation stats per habit from a clear date boundary without deleting older check-ins, and the Habits Motivation surface now explains history and status with fewer ambiguous pills/toggles.
- `validation`: Targeted unit/component/domain/API tests passed, `npm run verify:pre-pr` full lane passed on `c0252254`, PR CI required checks passed, and `npm run verify:pre-merge` passed before merge. Linked Supabase migration `20260607143000_habits_stats_reset_events.sql` was applied and drift-checked.
- `10/10 claim`: yes - critical target categories are listed below and each reached `5/5`.

Critical target categories confirmed `5/5`:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#1009` shipped per-habit reset stats without history deletion, Calendar Comparison preservation, and top-level Motivation cleanup.                                                         | None         |
| UX flow clarity                               | `5/5`          | User-facing copy changed to `Reset these habit stats`, `Confirm reset stats?`, `Reset stats`, `Last stats restart`, and Calendar Comparison guidance; component tests and screenshots covered. | None         |
| Visual design quality                         | `5/5`          | Screenshot handoff covered mobile/desktop Habits, Details, confirmation, timed details, Motivation, and full-width history layout; owner explicitly waived refreshed final-copy screenshots.   | None         |
| Business logic correctness and data integrity | `5/5`          | Domain/server/route tests cover reset boundary selection, old-history preservation, Calendar marker separation, unsupported reset values, and no check-in mutation.                            | None         |
| Accessibility (a11y)                          | `5/5`          | Component coverage verifies accessible action/dialog labels and no loss of existing Habits semantics.                                                                                          | None         |
| Accessibility                                 | `5/5`          | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same evidence.                                                                                                                      | None         |
| Data placement and sync boundaries            | `5/5`          | Reset truth is server-canonical through `habit_motivation_resets`; local state remains UI-only and failures do not advance stats.                                                              | None         |
| Caching and invalidation strategy             | `5/5`          | Route/server diff preserves private no-store behavior and deterministic snapshot refresh after reset mutation.                                                                                 | None         |
| Reliability and failure handling              | `5/5`          | Route/domain tests cover missing habit, malformed date, cross-owner/unauthenticated denial, unknown reset type/status, and stable JSON failures.                                               | None         |
| Security and authz                            | `5/5`          | API route uses authenticated owner scope, RLS-backed reset table, and negative-path route tests.                                                                                               | None         |
| Privacy and compliance                        | `5/5`          | Analytics event avoids habit names/notes/private values; support docs use redacted reset/habit IDs and dates.                                                                                  | None         |
| Content governance                            | `5/5`          | Parent, AW-006 queue, design inventory, user-flow map, support runbook, and this completion record were updated; brief lint passed before PR.                                                  | None         |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md` documents privacy-safe reset diagnosis and preserved history behavior.                                                                                 | None         |
| i18n operational readiness                    | `5/5`          | Labels moved into responsive button/dialog/card patterns and long-copy risk was covered by screenshot handoff and component assertions.                                                        | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused Habits domain/server/component contracts, Supabase migration/types, existing tests, and added no dependency.                                                                            | None         |
| Testing and QA automation                     | `5/5`          | Targeted tests, typecheck, brief lint, diff check, `verify:pre-pr`, CI required checks, and `verify:pre-merge` all passed.                                                                     | None         |
| DevOps and rollback readiness                 | `5/5`          | Migration is explicit, linked drift check passed, rollback is PR revert plus reset table/migration handling; old check-ins remain unchanged.                                                   | None         |

Supporting categories closed without release-gate gaps: `Performance (CWV + payloads)` `4/5`, `Analytics and KPI observability` `4/5`, and `Scalability and cost efficiency` `4/5`.
