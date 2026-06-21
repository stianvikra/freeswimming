# Task Brief: Training History Actuals, Corrections, And Plan Vs Actual (10/10)

## Metadata

- `id`: `2026-06-21-training-history-actuals-corrections-plan-vs-actual-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-21`
- `updated`: `2026-06-21`
- `mode`: `runtime child / implementation`
- `parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `calendar_parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `garmin_send_boundary`: `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
- `garmin_receive_boundary`: `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@03dcb023`
- `audit_status`: `refreshed-ready`
- `decision`: Use this as the next local training-history child before any Garmin runtime work or provider reconciliation. First runtime execution should additively extend `completed_activity_events`; do not create a separate `training_actuals` table in this slice.
- `reason`: Calendar now has planned instances, planned-only edits, manual completion, and daily Habits/Micro layers. The next integrity gap is that actual swim history can differ from the plan and must be editable without rewriting the planned session or pretending Garmin data is authoritative.
- `must_refresh_before_execution_if`: Refresh if `completed_activity_events`, `planned_workout_instances`, Calendar Plan rendering, workout/session step contracts, Garmin provider access/payload samples, Help/Guide support contracts, scorecard categories, or verification lanes change.

## Execution Refresh Audit

- `refreshed_on`: `2026-06-21`
- `refreshed_base`: `main@03dcb023`
- `local_surfaces_checked`:
  - `supabase/migrations/20260621123000_completed_activity_events_manual_swim_completion.sql`
  - `types/database.ts`
  - `lib/my-library/completed-activity-events.ts`
  - `lib/my-library/calendar-plan.ts`
  - `app/api/my-library/calendar/planned-instances/[instanceId]/completion/route.ts`
  - `components/my-library/CalendarPlanWeekHub.tsx`
  - `components/my-library/CalendarPlanSessionActions.tsx`
  - `tests/unit/calendar-completion-route.test.ts`
  - `tests/unit/my-library-calendar-plan.test.ts`
  - `tests/unit/calendar-plan-week-hub.test.tsx`
  - `docs/api-contracts.md`
  - `docs/user-flow-map.md`
  - `docs/runbooks/auth-account-support.md`
- `official_docs_checked`:
  - Supabase RLS update policy guidance: update policies need both `using` and `with check` ownership conditions.
  - Supabase generated TypeScript types guidance: schema changes must be reflected in generated database types.
  - Next.js Route Handlers guidance: `POST`/`PATCH` handlers are not cached by default.
  - Next.js `router.refresh` / `revalidatePath` guidance: `router.refresh()` refreshes the current route client cache, while server-side cache invalidation requires `revalidatePath`/tags when cached server data is introduced.
- `recommended_first_runtime_slice`: Extend the existing manual completion row into the first actual-history row because it already owns the stable owner-scoped planned-instance link, unique duplicate guard, planned snapshot, Calendar loader, and tests. A new table would add migration/backfill/UI complexity before provider evidence exists.
- `table_name_caveat`: `completed_activity_events` is a legacy name after this slice. Runtime/UI/docs should describe it as manual swim actual history, while future provider raw evidence and reconciliation still belong in separate future tables.
- `legacy_outcome_policy`: Existing `outcome = completed` rows are a known legacy alias for `completed_as_planned`. New writes should use the expanded outcome contract, and runtime reads/tests must keep the legacy alias safe until a later cleanup explicitly removes it.
- `cache_decision`: The current Calendar page is `force-dynamic` and mutation routes use no-store JSON, so the first slice can rely on `router.refresh()` after successful plan/manual-completion mutations. If a future actual-detail route adds cached history/Stats reads, it must add explicit `revalidatePath` or tag invalidation in the same PR.
- `do_not_expand`: No Garmin runtime, Stats Swimming aggregation, source workout/program mutation, Perfect Day Calendar layer, performance-ratchet tightening, or `Ja.docx` change belongs in this execution.
- `workout_revision_decision`: Calendar may link to the source workout for review, but this slice must not solve shared-workout edit semantics. Saved workout revisions and the `Save as new revision` vs `Update shared workout` decision are captured in `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`; until that contract ships, Calendar actual rows must not imply that editing the planned workout safely changes only one performed session.

## Goal

Let users record and correct what actually happened in a swim session, then compare plan vs actual without collapsing planned, manual, sent, received, and reconciled truth into one mutable flag.

## Pre-Implementation Owner Explanation

Codex skal senere gjøre faktisk utførte svømmeøkter redigerbare som egen historikk. Det betyr at en planlagt økt kan stå som planen, mens brukeren kan registrere at de faktisk svømte kortere, flyttet dato, stoppet halvveis, byttet stil, eller gjorde noe annet. Utenfor scope er Garmin-kobling, Garmin-import, automatisk AI-evaluering, Perfect Day, performance-ratchet og `Ja.docx`.

## Current Repo State

- `planned_workout_instances` owns intended occurrences.
- `completed_activity_events` exists for manual `completed` events from Calendar.
- Calendar can show planned, rescheduled, skipped, cancelled, recovered, completed, review, Habits, and Micro Session daily layer states.
- Calendar Stats still shows `Swimming` as not included until completed swim history is explicitly mapped into comparison totals.
- Garmin Training API and Activity API work remains blocked until partner/API credentials, provider samples, and support/attribution facts exist.

## Source Separation Contract

| Layer                    | Canonical owner                   | Meaning                                                     | Must not do                                            |
| ------------------------ | --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| Planned occurrence       | `planned_workout_instances`       | What the user intended to do.                               | Must not be rewritten to look like the actual session. |
| Manual actual            | training-history actuals          | What the user says actually happened.                       | Must not overwrite the plan or raw provider evidence.  |
| Garmin send job          | future Garmin Training API tables | What FreeSwimming sent or tried to send.                    | Must not count as completed.                           |
| Garmin received evidence | future Garmin Activity API tables | What Garmin reports from the device.                        | Must not silently replace manual actuals.              |
| Reconciliation           | future review state               | How planned, sent, received, and actual records are linked. | Must not hide conflicts or ambiguous matches.          |

## Scope

- Extend the local actual-history contract beyond simple `completed`:
  - legacy read alias: `completed` means `completed_as_planned`,
  - `completed_as_planned`,
  - `completed_different`,
  - `partial`,
  - `completed_on_another_day`,
  - `cancelled_as_actual`,
  - `needs_review`.
- Additively extend `completed_activity_events` for the first runtime slice rather than introducing a new table.
- Add the server-side correction contract for an existing manual completed swim event without changing the planned instance.
- Store the actual date through the existing `completed_on` field for compatibility, plus nullable actual-start time, duration, distance, pool/open-water context, pool length/unit, and bounded correction notes where supplied.
- Preserve the planned snapshot and canonical planned/workout/program references for plan-vs-actual comparison.
- Show plan and actual side by side in Calendar selected-day detail as a read-only overview, with dedicated history review/editing deferred to the future `Review actual` surface.
- Add deterministic plan-vs-actual signals:
  - as planned,
  - changed,
  - partial,
  - done on another day,
  - missed/no actual yet,
  - review needed.
- Keep Calendar month cells scan-first; detailed correction actions belong in selected-day detail or history detail.
- In the first slice, show actual statuses on the linked planned day. Do not add standalone actual-date-only Calendar rows unless a dedicated history route is explicitly included.
- Prepare the actual-history model so future Garmin received activities can be linked, detached, ignored, or reviewed without replacing manual history.

## Out Of Scope

- Garmin OAuth, send jobs, Activity API ingestion, FIT parsing, provider webhooks, provider matching, or live provider calls.
- Automatic replanning of future workouts after an actual differs from plan.
- AI retrospective evaluation or coaching recommendations.
- Editing the canonical source workout/program from an actual-history correction.
- Workout revision/versioning, including `Save as new revision` vs `Update shared workout` prompts for workouts reused across plans, Garmin sends, or actual history.
- Stats Swimming aggregation unless explicitly included in the execution refresh.
- Finance/admin dashboards, checkout, entitlement, or public SEO surfaces.
- Performance-ratchet tightening before at least two new green weekly cycles after `2026-06-19`.
- Touching `Ja.docx`.

## Data Placement And Sync Contract

- Server-canonical:
  - immutable actual-history/completed-event ID,
  - owner ID,
  - planned instance reference when available,
  - workout/program references when available,
  - source kind (`manual` in this child),
  - actual outcome state,
  - actual date through `completed_on`,
  - nullable actual start timestamp when supplied,
  - nullable actual distance, duration, environment, pool length/unit, and bounded correction note when supplied,
  - planned snapshot/reference payload needed for comparison,
  - correction audit timestamps.
- Local-only:
  - open correction form state,
  - unsaved correction notes,
  - selected comparison filters.
- Sync behavior:
  - planned rows remain planning truth;
  - actual rows remain what happened;
  - correction writes update actual-history state only;
  - Calendar, history detail, and any future Stats Swimming mapping invalidate after correction;
  - duplicate submissions stay idempotent for the same planned actual unless the user explicitly creates a separate actual record.
- Conflict policy:
  - stale actual rows, stale planned references, unknown outcomes, duplicate actuals, and completed-vs-cancelled conflicts fail closed to review/retry states;
  - correction routes must use the actual row `updated_at` as the stale-write guard, and must not require mutating the planned row;
  - corrections never mutate raw future provider evidence;
  - provider evidence later attaches through reconciliation, not actual-row overwrite.
- Retention and sensitivity:
  - actual swim history is private personal training data;
  - notes and measured values must be minimized in logs/events;
  - no raw Garmin files or provider payloads belong in this local-only child.
- Cache/invalidation:
  - private routes stay authenticated and owner-scoped;
  - writes refresh the affected Calendar/history windows, not unrelated source layers.

## Identity And Rename Contract

- Canonical stable IDs:
  - `planned_workout_instances.id` identifies the intended occurrence;
  - actual-history/completed-event ID identifies what happened;
  - future provider activity IDs and send job IDs are foreign aliases only.
- Human-readable identifiers:
  - workout title, program title, date labels, and status labels are presentation only.
- Mutability rules:
  - correcting what happened updates the actual-history row or creates a new explicit actual row according to the execution refresh;
  - correcting the plan uses planned-instance actions, not actual-history fields;
  - changing the source workout/program after the fact must not rewrite existing actual evidence silently.
- Shared workout revision rule:
  - a future workout contract must decide whether a plan instance points to a mutable workout, immutable snapshot, or explicit revision;
  - if a workout is already reused by other plans, sent to Garmin, or linked to actual history, future editing should default to saving a new revision unless the user explicitly chooses to update the shared workout.
- Rename vs repurpose:
  - renaming a workout/program preserves references;
  - materially repurposing a workout/program should create a new canonical entity before future actuals attach.
- Compatibility contract:
  - analytics, Calendar, future Garmin reconciliation, exports, and AI review resolve canonical IDs and state enums, not titles.
- Observability and repair:
  - duplicate actuals, stale planned references, missing workout references, unknown outcomes, and future provider conflicts must be measurable and supportable.

## Forward Compatibility Contract

- Extensibility surfaces:
  - actual outcome states,
  - source kinds,
  - correction actions,
  - provider aliases,
  - reconciliation states,
  - Calendar status labels,
  - Stats Swimming mappings,
  - analytics event values,
  - export formats,
  - locales.
- Source of truth:
  - planned truth derives from `planned_workout_instances`;
  - actual truth derives from training-history actuals;
  - Garmin send state derives from future send jobs;
  - Garmin received evidence derives from future Activity API evidence tables.
- Additive behavior:
  - new manual actual rows using known outcome/source contracts should appear in Calendar/history summaries automatically;
  - new provider evidence should remain hidden or review-only until reconciliation explicitly maps it.
- Explicit mapping requirements:
  - new actual outcomes, source kinds, provider states, reconciliation actions, Stats Swimming fields, analytics events, or public export formats require typed mapping, copy, docs, and tests.
- Unknown or deprecated values:
  - fail closed to `needs_review`/unmapped;
  - never count as completed, matched, or as-planned without explicit mapping.
- Test/evidence:
  - runtime execution must include unknown-outcome fixtures, duplicate/stale correction tests, plan-vs-actual fixtures, and route/label/support sweep evidence.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/calendar` selected-day detail and/or a My Library history detail route;
  - keep Calendar month cells scan-only;
  - keep correction actions in selected-day/detail surfaces with clear loading/error states.
- TypeScript/domain:
  - model outcomes, sources, correction actions, and reconciliation placeholders as typed allowlists;
  - unknown values fail closed to review states.
- Supabase/data:
  - runtime implementation should use explicit additive migrations on `completed_activity_events`;
  - grant `update` only as needed and add owner-scoped `update` RLS with both `using` and `with check`;
  - retain the existing unique duplicate guard for one manual actual per planned instance in this slice;
  - generated DB types must include every schema change in the same PR;
  - RLS must be owner-scoped and negative-path tested;
  - generated DB types must be updated in the same PR if schema changes.
- External services:
  - no provider SDK or network call belongs in this child;
  - future Garmin work must re-check official docs and use provider sample fixtures.
- UI system:
  - reuse My Library/Calendar tokens, status chips, action density, and accessible form controls;
  - screenshot handoff is required before broad PR gates because this changes user-facing history/correction UI.
- Testing:
  - include route/action, data invariant, component, accessibility, stale/duplicate/unknown, migration/type, and screenshot evidence.

## First Runtime Slice Recommendation

Implement the first slice in this order:

1. Additive migration and generated type update:
   - widen `completed_activity_events.outcome` to include the expanded actual outcomes plus the legacy `completed` alias while the app is deploying,
   - add nullable actual fields for started-at, duration, distance, environment, pool length/unit, and correction note,
   - add `update` grant and owner-scoped update RLS with both `using` and `with check`,
   - keep the existing `completed_activity_events_planned_unique` constraint.
2. Domain/view-model update:
   - centralize outcome/source normalization in `lib/my-library/completed-activity-events.ts`,
   - treat legacy `completed` as `completed_as_planned`,
   - expose deterministic plan-vs-actual signals without counting unknown outcomes as completed.
3. Route update:
   - keep `POST /completion` as the idempotent mark-as-done entrypoint, writing `completed_as_planned` for new rows,
   - add `PATCH /completion` for correcting the existing owner-scoped manual actual row,
   - validate supported outcomes and bounded measured fields,
   - guard stale writes with actual-row `updated_at`,
   - never update `planned_workout_instances`, `workouts`, or `programs` from the correction route.
4. UI update:
   - reuse Calendar selected-day session rows,
   - keep month cells scan-first with compact statuses only,
   - replace the completed-state dead end with read-only plan-vs-actual overview in Calendar,
   - show `Review actual` as the future actual/reconciliation action, but do not expose inline actual editing in Calendar,
   - keep `Open workout` scoped to source/planned workout truth, not what was performed,
   - keep plan actions disabled after actual history exists.
5. Docs/tests/screenshot:
   - update API contract, user flow map, and support runbook,
   - add route/component/view-model tests for as-planned, changed, partial, another-day, cancelled-as-actual, needs-review, legacy `completed`, unknown values, duplicate, stale, unauthenticated, and cross-owner paths,
   - provide the required screenshot handoff before broad PR gates.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo lint/verify scripts, `playwright` skill for future screenshot handoff, official Garmin docs for provider-boundary facts.
- Evaluate later: Garmin provider runtime may need fresh official-doc review and provider fixtures after partner access; no new local Codex skill/plugin is needed now.
- Install/config changes: none.

Systemic findings:

| Surface                  | Finding                                                                                                                               | Severity | Recommended Type                 | Owner Decision Needed                                         | Follow-Up Brief Path                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Training-history actuals | Manual completion currently records a simple completed event, but real swims can differ from the plan and need editable actual truth. | `high`   | `bounded implementation child`   | `no`                                                          | this brief                                                                               |
| Plan vs actual           | Calendar should compare intended and actual versions without rewriting either side.                                                   | `high`   | `bounded implementation child`   | `no`                                                          | this brief                                                                               |
| Garmin readiness         | Provider send/receive reconciliation needs local actual correction semantics before Garmin can safely attach mismatched evidence.     | `high`   | `deferred architecture decision` | `yes - unblock requires Garmin partner/API facts and samples` | `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md` |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Calendar parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Last merged Calendar workstream: PR `#1197` plus closeout PR `#1198`.
- Next planning step: owner may explicitly execute this child after the docs-only audit PR merges.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can distinguish planned, actual, changed, partial, missed, and review-needed swim states without Garmin assumptions.          | route/state map + UI tests + screenshot handoff | `5/5`                   |
| UX flow clarity                               | `target`     | Calendar shows read-only plan-vs-actual truth with clear planned actions and an explicit future `Review actual` path.               | component/e2e tests + copy review               | `5/5`                   |
| Visual design quality                         | `target`     | Plan-vs-actual detail is readable on mobile/desktop and does not crowd month cells.                                                 | responsive screenshot handoff                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Actual-history corrections are idempotent, owner-scoped, separate from planned rows, and preserve planned snapshots.                | migration/route/invariant tests                 | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: primary workflow is end-user history correction; admin tooling is not required in this child.                      | scope rationale                                 | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Read-only actual overview rows, status chips, and review states are keyboard and screen-reader usable.                              | a11y tests + keyboard QA                        | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Calendar/history reads stay window-bounded and add no unnecessary dependency or large client payload.                               | query review + perf gate                        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned, actual, sent, received, and reconciled truths remain separate with explicit invalidation.                                  | data contract + integration tests               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Corrections refresh Calendar/history summaries predictably without stale success states.                                            | invalidation tests                              | `5/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, stale, missing-ref, unknown outcome, schema-missing, and unexpected failure paths have bounded recovery.                 | negative-path tests                             | `5/5`                   |
| Security and authz                            | `target`     | Anonymous and cross-user correction attempts fail closed and leak no private training data.                                         | authz tests                                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Actual-history payloads minimize private notes/measures and exclude raw provider data.                                              | payload/log review + tests                      | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program source content remains upstream; actuals preserve references/snapshots.                            | source contract review                          | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: support visibility may come later; no role-gated admin CRUD changes in this child.                                 | support-scope rationale                         | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because actual training history is authenticated private data and no public crawl surface changes.                              | private-route rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private actual-history data does not create public AI-discoverable content.                                             | private-data rationale                          | `N/A`                   |
| Analytics and KPI observability               | `target`     | Correction/review events use stable safe taxonomy and avoid double-counting completion.                                             | event tests or explicit no-new-event rationale  | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: actual-history correction does not mutate checkout, billing, entitlement, or product catalog truth.                | commerce non-impact review                      | `4/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose duplicate, stale, missing-ref, unknown, partial, another-day, and future provider-conflict states.             | runbook/support-copy review                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not change revenue, refunds, payouts, invoices, entitlement reporting, or accounting data.              | explicit finance non-scope rationale            | `N/A`                   |
| i18n operational readiness                    | `target`     | Outcome/source/review labels avoid identity coupling and tolerate translation expansion.                                            | copy contract + responsive tests                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js, TypeScript, Supabase/RLS, Calendar/My Library primitives, and provider-boundary docs; add no unnecessary dependency. | package diff + architecture review              | `5/5`                   |
| Testing and QA automation                     | `target`     | Include unit/integration/component/e2e/negative-path/screenshot evidence plus `verify:pre-pr`, CI, and `verify:pre-merge`.          | validation outputs                              | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Correction writes are bounded/idempotent and summary reads avoid N+1 across Calendar/history windows.                               | query/job tests                                 | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Schema/action/UI changes are reversible and can be disabled without corrupting planned or future provider evidence.                 | migration/rollback notes + PR validation        | `5/5`                   |

## Help/Guide And Support-Surface Impact

- Runtime implementation changes user recovery behavior and must update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and any Help/Guide assertions in the same PR.
- Route/label/support sweep must include Calendar, History, planned/actual labels, partial/changed states, correction actions, Garmin/provider review labels, and analytics taxonomy.
- If execution stays docs-only, record explicit `N/A` rationale for visible Help/Guide runtime updates.

Route/label/support sweep evidence:

- Identifiers searched:
  - `Partial`,
  - `Partly done`,
  - `Save actual`,
  - `Save completion`,
  - `Open workout`,
  - `Review actual`,
  - `Actual outcome`,
  - `Completion status`,
  - `Completion date`,
  - `completed_different`,
  - `completed_on_another_day`,
  - `cancelled_as_actual`,
  - `needs_review`,
  - `completed_activity_events`,
  - `actual-history`,
  - `actual history`,
  - `plan-vs-actual`.
- Surfaces checked / directories-surfaced:
  - `app/`,
  - `components/`,
  - `lib/`,
  - `tests/`,
  - `docs/`,
  - `docs/runbooks/`,
  - `docs/task-briefs/planned/`,
  - `docs/task-briefs/in-progress/`,
  - `docs/task-briefs/done/`.
- Fallout handled:
  - active app/code/tests/docs use `Partly done`, read-only Calendar actual overview, and `Review actual` future action consistently;
  - stale `Save actual` / `Save completion` Calendar UI references were removed from the runtime surface;
  - `Open workout` is documented as source/planned truth only and must not imply actual editing;
  - historical `done/` brief mentions remain as closed PR history.

API failure-mode evidence:

- No unexpected 500 behavior is allowed for known user/action states:
  - unauthenticated returns `401`,
  - cross-user/missing planned row returns `404`,
  - invalid JSON/body/outcome returns `400`,
  - stale planned/actual writes and unsupported future states return `409`,
  - schema-missing or not-yet-mapped completion history returns `503`.
- Unexpected database failures use bounded JSON `500` responses with generic copy and server logging only; targeted route tests include a completion insert failure-mode fixture that returns `Could not mark this session done right now.` without leaking database details.

## Screenshot Contract

- This is UI work when executed.
- Owner approved the latest `after/reference` handoff on `2026-06-21`.
- Approved artifacts: `output/training-history-actuals-corrections-2026-06-21-195637`.
- Capture `after/reference` screenshots comparing:
  - Calendar selected-day detail with plan-vs-actual,
  - read-only actual overview and disabled future `Review actual` action,
  - partial/changed/review state,
  - existing completed-as-planned reference.
- Pause for owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Acceptance Criteria

- Manual actual corrections can update actual-history state without mutating the planned instance.
- Calendar actual rows stay read-only until the dedicated `Review actual` workflow owns performed-session editing.
- Plan and actual versions are visible as separate truths.
- Partial, changed, another-day, missed/no-actual, and review-needed states are deterministic.
- Future Garmin received evidence can attach through reconciliation without overwriting manual actuals.
- Unknown outcome/source/provider values fail closed and do not count as completed/as-planned.
- Support docs can diagnose duplicate, stale, missing-reference, unknown, and future provider-conflict states.

## Validation Plan

- `npm run lint:briefs`
- Runtime execution later:
  - migration/type validation if schema changes,
  - route/action/authz/idempotency/stale tests,
  - plan-vs-actual component tests,
  - route-label/support-surface impact sweep,
  - screenshot handoff and owner approval,
  - `npm run verify:pre-pr`,
  - GitHub CI required checks,
  - `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-21 | planned | created after owner asked how to handle planned sessions, manual actual corrections, Garmin returned activities that differ from plan, and the 10/10 boundary between planned, sent, received, and actually performed truth | next: keep this planned until owner explicitly asks for runtime execution`
- `2026-06-21 | in-progress | owner approved the refreshed additive completed_activity_events runtime slice through screenshot handoff; moved brief to in-progress on branch training-history-actuals-corrections from main@03dcb023 | next: implement schema/domain/API/UI/tests/docs, run targeted QA, then stop for screenshot approval before broad PR gates`
- `2026-06-21 | in-progress | additive actual-history schema/domain/API/UI/docs/tests implemented; targeted route/view-model/component tests, typecheck, lint, full unit suite, and all-brief lint are green; screenshot handoff captured in output/training-history-actuals-corrections-2026-06-21-192400 after removing the temporary visual harness route | next: wait for owner screenshot approval before verify:pre-pr, commit, push, PR, and merge-readiness gates`
- `2026-06-21 | in-progress | owner requested visual copy/layout corrections after screenshot review; changed Partial to Partly done, renamed correction labels to Completion date/status, made start time time-only, tightened mobile two-column form layout, widened mobile save/filter controls, updated support docs/tests, and regenerated screenshots in output/training-history-actuals-corrections-2026-06-21-194054 after removing the temporary visual harness route | next: wait for owner screenshot approval before verify:pre-pr, commit, push, PR, and merge-readiness gates`
- `2026-06-21 | in-progress | owner clarified Calendar must not edit performed workout structure because actual truth may be app-built, Garmin-built, sent to Garmin, and returned as provider evidence; removed inline actual form from Calendar, made actual rows read-only overview, kept source workout editing separate, and exposed disabled Review actual as the future dedicated actual/reconciliation action | next: regenerate screenshot handoff and wait for owner approval before verify:pre-pr, commit, push, PR, and merge-readiness gates`
- `2026-06-21 | in-progress | regenerated after/reference screenshot handoff in output/training-history-actuals-corrections-2026-06-21-195637; actual Calendar row shows read-only plan-vs-actual details, disabled Review actual, no inline Save completion, and no Open workout on the actual row; temporary visual harness route was removed and confirmed 404; targeted route/model/component tests, typecheck, lint, and all-brief lint are green | next: wait for owner screenshot approval before verify:pre-pr, commit, push, PR, and merge-readiness gates`
- `2026-06-21 | in-progress | owner approved screenshot handoff and raised shared-workout edit risk; documented that workout revisions, immutable snapshots, and Save as new revision vs Update shared workout belong to the workout data-contract brief before any Calendar/workout editor implies a reused workout can be safely edited in place | next: run verify:pre-pr, commit, push, open PR, monitor CI, then run verify:pre-merge before merge readiness`
- `2026-06-21 | in-progress | first verify:pre-pr stopped on expected Supabase migration drift; confirmed linked project freeswimming-org-prod/sazgjhgxvmxcyowovond, migration list and dry-run showed exactly local-only 20260621143000_completed_activity_events_actual_corrections.sql, applied it with npx supabase db push --linked --yes, post-apply dry-run reported Remote database is up to date, post-apply migration list showed local/remote parity, and linked typegen to /tmp confirmed the completed_activity_events actual fields match types/database.ts | next: rerun verify:pre-pr`
- `2026-06-21 | in-progress | verify:pre-pr passed after remote migration sync and quality-gate evidence updates; full lane completed branch-current, migration drift, lint, typecheck, 1682 unit tests, build, perf budgets, and e2e 111 passed / 567 skipped; perf gate recommended tightening after long green trend, but active decision remains HOLD because this workstream must wait for at least two new weekly green cycles after 2026-06-19 before ratcheting | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge readiness`
