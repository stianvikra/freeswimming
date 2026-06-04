# Task Brief: AW-006 Habits Timed Timer/Manual UX (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-habits-timed-timer-manual-ux-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-04`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner explicitly said execute`
- `resolved_findings`: `H-001`, `H-002`, `H-011`, `H-012` when implemented and validated
- `deferred_findings`: `H-005`, `H-006`, `H-008`, remaining `H-010`, `H-013`
- `return_checkpoint`: update the parent brief before this child can be closeout-ready
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-04`
- `base`: `main@4c06c95`
- `audit_status`: `ready`
- `decision`: Execute this as the active Habits Child B slice after the owner explicitly said `execute Child B`.
- `reason`: `main` was clean and synced after Habits Tracking Semantics PR `#977` and repo-managed closeout PR `#978`; post-merge preflight was reported green; the Habits parent shows H-001/H-002/H-011/H-012 deferred to Timed Habits; fresh audit found the current timed habit UI still has duplicate time display plus one server numeric check-in value for both timer and manual entry; the owner explicitly approved execution.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, habits API/storage/local timer contracts, `habit_check_ins` schema, `types/database.ts`, localStorage timer version, analytics payload rules, Help/Guide/support rules, screenshot handoff rules, route/label/support sweep rules, benchmark assumptions about timed/manual habit apps, or verification lanes change before execution.

## Goal

Make timed habits show one trustworthy daily time total, make manual time clearly mean external time, and make one-active-timer behavior deterministic without adding sound or a history dashboard in this first pass.

## Pre-Implementation Owner Explanation

Vi rydder timer- og manualtid for Habits. Brukeren skal se en tydelig dagens total, forsta at manual time er tid gjort utenfor appen, og slippe at kortet ser ut som det har to ulike timere.

Hvorfor det betyr noe: Hvis tidstelling virker uklar, mister brukeren tillit til Habits og historikk senere bygges pa feil grunnlag.

Utenfor scope er lyd, reminders, full historikk/dashboard, database-migrering for separate timer-kilder, eksport, admin-notes spacing, og bred redesign.

Fremoverkompatibilitet: nye timer-kilder, statusverdier eller manual-time typer skal enten ga gjennom en typed timer/check-in kontrakt med tester, eller feile synlig som unmapped/not-counted til de er eksplisitt mappet.

## Fresh Audit Summary

### Local Code Audit

- `components/my-library/habits/HabitPerfectDayHub.tsx`
  - Timed total display is currently split between `getTimedStatusLabel(item, timerSeconds)` and a separate visible timer control showing `formatTimer(timerSeconds)`.
  - `getTimedProgressSeconds` currently prefers local `timerSeconds` when it is greater than zero, otherwise falls back to saved `item.checkIn.valueNumeric`. This means a resumed timer can visually hide already saved minutes instead of showing saved time plus the active local timer.
  - Local timer state is stored under `freeswimming:habits:v3:timers:<user>:<date>` with `elapsedSeconds`, `startedAtMs`, and `targetSeconds`; this is local recovery state, not server truth.
  - `startTimer` starts the selected habit without pausing any other running habit timer.
  - `finishTimer` saves elapsed local timer seconds as `valueNumeric`; `Save manual` also saves `valueNumeric`. There is no persistent source field that separates manual time from timer time today.
  - Expanded details still label the manual field as `Manual min` and action as `Save manual`; child execution should use clearer manual-time copy and accessible labels.
- `lib/habits/shared.ts`
  - `HabitCheckInView.valueNumeric` is the current server-canonical numeric value for duration habits.
  - `buildHabitCheckInInsert` accepts one numeric value per habit/date and rejects empty non-skipped check-ins.
  - `evaluateHabitForDate`, cadence progress, day summary, and week summary derive completion from saved check-ins only.
- `lib/habits/server.ts`
  - `loadHabitSnapshot` reads active/archived habit definitions and check-ins, then returns derived summaries.
  - Child B should preserve `force-dynamic` route behavior and no-store API snapshots unless execution explicitly scopes a cache change.
- `lib/habits/schema.ts`
  - Schema-missing detection includes habit/timer metadata markers but no separate timer-source marker.
- `app/my-library/habits/page.tsx`
  - Authenticated route boundary and `TrackEventOnMount` are outside this child unless route-shell evidence needs screenshot capture.
- `app/api/my-library/habits/check-ins/route.ts`
  - The route fails closed for unauthenticated users, validates habit ownership, upserts one check-in per `user_id/habit_id/check_in_date`, returns a refreshed snapshot, and emits `habit_timer_saved` for timed numeric values.
  - Additive manual-time semantics cannot be claimed as separate durable timer/manual event history without a schema/API expansion.
- `supabase/migrations/20260510153000_habits_perfect_day_foundation.sql`
  - `habit_check_ins` has one row per user/habit/date with a single `value_numeric` field and RLS policies for own rows.
- `supabase/migrations/20260512103000_habits_v2_build_quit_timed_tracking.sql`
  - Timed habit metadata lives on `habit_definitions` via `timer_enabled` and `timer_target_seconds`.
- `types/database.ts`
  - Generated types match the single numeric check-in model.
- `tests/unit/habits.test.ts`
  - Existing domain tests cover timed habit metadata, mixed duration summaries, cadence, rest, and motivation.
- `tests/unit/habit-perfect-day-hub.test.tsx`
  - Existing component tests cover startable timed rows, paused/running local timer restoration, successful timer save, and rest-day suppression of timer controls.
  - Missing coverage for saved time plus active local timer total, one-active-timer switching, duplicate timer display removal, and manual-time copy.

### Benchmark Refresh

Official/primary sources checked on `2026-06-04`:

| Source                                                                                                                              | Current pattern                                                                                                                                  | Implication for this child                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Productive Help Center, `https://support.productiveapp.io/hc/en-us/articles/26920738331665-Timer-and-its-functions`                 | Habit timers have explicit start, pause, restart, and close controls.                                                                            | Timer controls should be obvious and not look like multiple independent timers.                         |
| Productive Help Center, `https://help.productive.io/en/articles/3903111-using-the-timer-to-track-time`                              | Time tracking distinguishes timer and manual entry; timer details can show other time tracked for the day and logs include timer/manual entries. | FreeSwimming should show one daily total while keeping manual time semantically external.               |
| Streaks App Store, `https://apps.apple.com/us/app/streaks/id963034692`                                                              | Timed tasks, current/best streaks, notes, and timer-related fixes are active product concerns.                                                   | Timed habit behavior needs deterministic pause/resume and visible state contracts.                      |
| Habitify Help Center, `https://intercom.help/habitify-app/en/articles/11203360-view-the-progress-of-a-habit-on-website-desktop-app` | Progress distinguishes completion, failed, skipped, and period-based streaks.                                                                    | This child should avoid hardcoding today's timed state in a way that blocks future history/status work. |
| Loop Habit Tracker, `https://play.google.com/store/apps/details/?hl=en-US&id=org.isoron.uhabits`                                    | Habit strength, detailed history, flexible schedules, reminders, privacy, and export are mature tracker expectations.                            | History/reminders/export stay deferred, but timer totals must be stable enough for later insights.      |

### Finding Disposition

| ID    | Disposition for Child B  | Notes                                                                                                                                                                                            |
| ----- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H-001 | `in scope`               | Define and implement today's displayed total as saved server minutes plus current local timer seconds where data exists, without claiming separate durable sources unless a migration is scoped. |
| H-002 | `in scope`               | Replace unclear timer/manual labels with `Manual time` / `Add manual time` style copy where user-facing.                                                                                         |
| H-003 | `not affected`           | Resolved by Child A; do not reopen streak/slip motivation.                                                                                                                                       |
| H-004 | `not affected`           | Resolved by Child A; preserve rest-day behavior and tests.                                                                                                                                       |
| H-005 | `deferred`               | Sound is explicitly out of first pass and belongs to a later local preference/sound child.                                                                                                       |
| H-006 | `deferred`               | Same sound preference contract as H-005.                                                                                                                                                         |
| H-007 | `not affected`           | Resolved by Child A; preserve weekly/monthly target-met state.                                                                                                                                   |
| H-008 | `deferred`               | Mobile admin-notes/bottom-nav spacing belongs to Child D.                                                                                                                                        |
| H-009 | `satisfied for planning` | Benchmark refresh completed for this planned child; repeat before execution if stale triggers occur.                                                                                             |
| H-010 | `partially in scope`     | Timer/manual/one-active-timer gap is in scope; backfill, best streak, habit score, calendar/history, notes, archive history, reminders, sound, and export stay deferred.                         |
| H-011 | `in scope`               | Remove duplicate visible timer display or make one display secondary/non-duplicative.                                                                                                            |
| H-012 | `in scope`               | Product decision for this child: one active Habits timer by default; starting another timer pauses/switches intentionally.                                                                       |
| H-013 | `not affected`           | Broad chip/card hierarchy was partially handled in Child A; only timer-specific layout may change.                                                                                               |
| H-014 | `ongoing`                | Append any new owner findings to the parent before execution or during the child.                                                                                                                |

### Data-Boundary Decision For Planned Execution

- Server-canonical:
  - habit definitions;
  - one check-in row per user/habit/date;
  - `valueNumeric` for persisted duration minutes until a future migration adds source/event history;
  - post-mutation snapshot from habits API.
- Local-only:
  - running/paused timer state before save;
  - local timer recovery record keyed by user/date;
  - transient row expansion and in-progress input text.
- Derived view-model:
  - displayed timed total for today;
  - timer action label;
  - progress-to-target label;
  - one-active-timer UI state.
- Sync policy:
  - local timer is not server truth until saved;
  - if saved server minutes exist and a local timer is running, the displayed total must add them;
  - saving a timer or manual time continues to receive a fresh server snapshot;
  - if the first implementation cannot safely make manual save additive without data ambiguity, it must either preserve overwrite semantics with explicit copy or scope an API contract change with tests.
- Unknown values:
  - unknown timer/manual source values must not count as completed until mapped.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim on this child:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Timed habit cards have one clear time-tracking job and do not mix timer/manual/history goals in the same first pass.                                                                 | brief scope, parent return update, screenshots                        | `5/5`                   |
| UX flow clarity                               | `target`     | User can understand Start/Pause/Resume/Finish/Reset/Add manual time, with one visible daily total and no duplicate timer source of truth.                                            | component tests + screenshot handoff                                  | `5/5`                   |
| Visual design quality                         | `target`     | Changed timer/manual controls preserve My Library card/tokens, mobile action layout, and readable timer text on mobile/desktop.                                                      | before/after or after/reference screenshots                           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Timer totals, manual entries, saved check-ins, rest days, reset, and one-active-timer transitions are deterministic and tested.                                                      | unit/component tests                                                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                                     | explicit admin-editor scope rationale                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Timer/manual controls have accessible names, keyboard support, status semantics, focus visibility, and no new serious/critical violations on changed surface.                        | component assertions + targeted browser/a11y evidence if scoped       | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same timer/manual control requirement.                                                                                    | component assertions + screenshot/a11y notes                          | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: changed client logic must avoid new dependencies and avoid material JS growth on `/my-library/habits`.                                                              | dependency diff + build/perf gate                                     | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Brief and implementation state exactly what is server-canonical, local-only, and derived for timer/manual totals.                                                                    | data contract + tests                                                 | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: preserve force-dynamic route/no-store mutation snapshots unless execution explicitly scopes another freshness contract.                                             | route/API audit + tests                                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Local timer persistence failures do not block check-ins; failed saves keep safe retry state; switching timers cannot lose already elapsed local time.                                | component tests + manual/screenshot QA notes                          | `5/5`                   |
| Security and authz                            | `target`     | Protected Habits API remains fail-closed; no unauthenticated or cross-user timer/check-in mutation path is introduced.                                                               | existing API tests or route audit + no API expansion rationale        | `5/5`                   |
| Privacy and compliance                        | `target`     | Habit titles, timer state, quit/rest data, and manual time remain private; no new analytics payload leaks raw habit names or notes.                                                  | analytics/API diff review                                             | `5/5`                   |
| Content governance                            | `target`     | Parent, child, AW-006 queue, and design inventory record selected/planned/in-progress/done status accurately.                                                                        | docs diff + brief lint                                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this child changes no admin workflow labels, support queue, admin notes behavior, or operator actions.                                                                   | explicit admin-workflow scope rationale                               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this child changes no public metadata, sitemap, robots, canonical URL, or structured data.                             | private-route SEO rationale                                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no crawl-safe public entity model, structured data, AI-facing page copy, or public docs surface.                                                      | AI-discoverability scope rationale                                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: preserve existing `habit_timer_saved` semantics unless execution explicitly scopes safe payload updates for manual/timer source.                                    | analytics diff review                                                 | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                          | commerce scope rationale                                              | `N/A`                   |
| Incident response and support operations      | `target`     | Timer/manual support diagnostics are documented in brief/PR; Help/Guide impact is decided because action meanings change.                                                            | Help/Guide/runbook diff or explicit rationale                         | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this child changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation. | explicit finance scope rationale                                      | `N/A`                   |
| i18n operational readiness                    | `target`     | Timer labels and manual-time copy avoid tight fixed-width assumptions and remain readable with longer localized strings.                                                             | screenshot handoff + responsive checks                                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, Habits domain helpers, existing API routes, My Library tokens, and current test stack; no new dependency.                                                | code diff review                                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused tests for saved+local timer totals, one-active-timer behavior, copy/accessibility, save/reset/rest interactions, plus required broad gates before PR/merge.              | targeted Vitest + `verify:pre-pr`/CI/`verify:pre-merge` when executed | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: do not add per-second server writes, background polling, or unbounded timer logs in this first pass.                                                                | code diff review                                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration in first pass unless explicitly added; rollback is normal git revert. If a migration becomes necessary, define rollback and generated type updates before execution.    | PR notes + validation gates                                           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: current `/my-library/habits` route and `HabitPerfectDayHub` after PR `#969` and PR `#977`.
  - Keep `app/my-library/habits/page.tsx` authenticated server route boundary.
  - Keep timer UI in the existing client component unless execution finds a small helper/view-model is needed to remove duplication.
  - Preserve `dynamic = "force-dynamic"` and API no-store responses unless explicitly changed.
- TypeScript/domain contracts:
  - Use `HabitDefinitionView`, `HabitCheckInView`, `HabitDayItem`, timer helpers, and check-in request types as the contract.
  - Add deterministic helper tests if total calculation is moved out of JSX.
  - Do not count unknown timer/manual source values as done.
- Supabase/data layer:
  - Preferred first pass: no migration.
  - If execution proves additive manual/timer semantics cannot be truthful with the current single `value_numeric`, pause for owner decision before adding source/event persistence.
  - Any migration path requires explicit RLS/authz review, generated DB types, negative-path tests, and rollback notes.
- External services/tools:
  - No external habit SDK, sound library, analytics vendor, HealthKit/native integration, or notification service.
- UI system:
  - Reuse `fs-library-card`, `fs-cta-*`, `ui-field`, mobile action layout rules, and current Habit card hierarchy.
  - Screenshot handoff type: `before/after` for `/my-library/habits` timed habit card on mobile and desktop where practical; otherwise `after/reference` with a clear explanation.
- Testing:
  - Focused component tests for timer display, one-active-timer behavior, manual-time copy, save/reset/rest interactions, and localStorage recovery.
  - Domain tests if total/progress helpers move into `lib/habits/shared.ts`.
  - Screenshot handoff before `npm run verify:pre-pr` because this is UI work.

## Data Placement And Sync Contract

- Server-canonical data:
  - `habit_definitions` rows and timed metadata (`timer_enabled`, `timer_target_seconds`);
  - `habit_check_ins` rows, one per user/habit/date;
  - `value_numeric` as the persisted duration minutes for a timed habit until a later source/event migration exists;
  - API-returned snapshot after check-in mutation.
- Local data:
  - running/paused timer elapsed seconds and start timestamp in localStorage;
  - selected date scoped timer recovery;
  - transient manual-time input text and row expansion.
- Sync policy:
  - local timer state does not sync across devices until saved;
  - saving a timer or manual time writes through the existing check-in API and replaces the visible snapshot with the server response;
  - one-active-timer switch must preserve elapsed local seconds on the paused timer;
  - reset clears only local timer/input for that habit unless the user uses the existing check-in undo/reset path.
- Retention and sensitivity:
  - local timer records are cleared when no eligible timer state remains and stale date records are already cleaned for the user;
  - do not log raw habit names, notes, or exact manual-time text to analytics or console.
- Cache/invalidation:
  - preserve no-store API responses and refreshed snapshots;
  - no static cache or revalidation change is planned.

## Identity And Rename Contract

- Canonical stable ID:
  - habit ID identifies timer state, check-ins, and local recovery records.
- Human-readable identifiers:
  - habit title is editable and must not be used as localStorage or mutation identity.
  - labels such as `Timed`, `Manual time`, `Start`, `Pause`, `Finish`, and `Add manual time` are display/workflow labels, not identity.
- Mutability rules:
  - editing a habit keeps history attached.
  - changing a habit away from timed mode must make local timer recovery ineligible for that habit/date.
- Rename vs repurpose policy:
  - renaming is allowed; materially repurposing a habit remains a product decision before history is reused.
- Compatibility contract:
  - existing check-ins without source fields remain readable as saved duration minutes.
  - unknown future source/status fields must not be counted as timer/manual truth until mapped.
- Observability and repair:
  - PR notes must document how to diagnose mismatches between local timer recovery, saved check-in value, and displayed total.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes, timer source types, manual source types, check-in statuses, localStorage timer version, timer action labels, analytics payload values, Help/Guide labels, and future export/history fields.
- Source of truth:
  - visible total derives from server-canonical saved check-in plus local timer state.
  - habit identity derives from stable habit ID.
  - labels should live in one helper/view-model path if execution adds or changes multiple timer labels.
- Additive behavior:
  - new timed habits returned by the current snapshot should inherit the timer/manual card behavior automatically.
  - new cadence periods should keep target display through existing cadence helpers unless explicitly unsupported.
- Explicit mapping requirements:
  - new timer source tables, manual/time-source enums, history event types, sounds, reminders, analytics source values, exports, native integrations, or multi-timer mode require mapping, tests, Help/Guide/support review, and likely a new child brief.
- Unknown or deprecated values:
  - fail closed for data truth; do not count unknown values as done, target-met, timer-saved, or manual-time additive without mapping.
- Test/evidence:
  - execution must include at least one future/unknown source or no-source fixture, or explicitly state why no new source field exists in this first pass.

## Help / Guide Impact

Help/Guide impact is likely required during execution because user-facing action meanings and labels change:

- `Manual min` / `Save manual` copy may change to `Manual time` / `Add manual time`.
- one-active-timer behavior changes what happens when starting another timer.
- support diagnosis for timer/manual mismatch should be documented either in Help/Guide, an existing runbook, or the PR body with explicit N/A rationale if no Help/Guide surface exists.

Execution update:

- updated `docs/runbooks/auth-account-support.md` with the new timed habit support contract:
  - one visible daily total is saved duration plus local timer time;
  - `Manual time` / `Add manual time` adds external minutes;
  - starting another timed habit pauses the current local timer;
  - local timer state is not server truth until saved.
- updated `docs/user-flow-map.md` so the user-flow source of truth matches the shipped labels and one-active-timer behavior.
- no admin Help/Guide content changed because this is a private member Habits workflow, not an admin operation surface.

## Route / Label / Support Surface Sweep

Run before broad gates during execution because labels/actions change.

Minimum search terms:

- `/my-library/habits`
- `HabitPerfectDayHub`
- `Manual min`
- `Save manual`
- `Manual time`
- `Add manual time`
- `Start`
- `Pause`
- `Resume`
- `Finish`
- `Reset`
- `timer`
- `habit_timer_saved`
- `freeswimming:habits:v3:timers`
- `valueNumeric`
- `value_numeric`

Minimum surfaces:

- `app/`
- `components/`
- `lib/habits/`
- `tests/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- Help/Guide assertions when workflow copy changes.

Execution sweep:

- identifiers searched:
  - `Manual min`;
  - `Save manual`;
  - `Manual time`;
  - `Add manual time`;
  - timer labels/actions;
  - `habit_timer_saved`;
  - `freeswimming:habits:v3:timers`;
  - `valueNumeric`;
  - `value_numeric`.
- surfaces checked:
  - `app/`;
  - `components/`;
  - `tests/`;
  - `docs/`;
  - `docs/runbooks/`;
  - active/planned task briefs.
- searched `Manual min`, `Save manual`, `Manual time`, `Add manual time`, timer labels/actions, `habit_timer_saved`, `freeswimming:habits:v3:timers`, `valueNumeric`, and `value_numeric` across `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, and active/planned task briefs.
- updated live support/user-flow fallout in `docs/runbooks/auth-account-support.md` and `docs/user-flow-map.md`.
- intentional leftovers:
  - active/parent brief mentions of `Manual min` and `Save manual` remain as historical audit findings and sweep terms;
  - unit test mentions of `Manual min` and `Save manual` are negative assertions proving the old labels are absent.

## Scope

- Create this planned Child B brief and record fresh audit evidence.
- During later execution only:
  - timed habit card total display;
  - manual-time labels and accessible names;
  - local timer resume/recovery display;
  - one-active-timer behavior;
  - focused tests and screenshot handoff;
  - parent/queue/inventory return updates.

## Out Of Scope

- Runtime implementation before explicit owner `execute`, `build`, or `implement`.
- Sound for target reached or mark done.
- Reminders, notifications, native integrations, HealthKit, or Apple Watch.
- Full history dashboard, calendar/heatmap, best streak, habit score, notes per log, backfill, archive-keep-history, export.
- Mobile contextual admin-notes spacing and broad `SiteChrome` safe-area work.
- Database migration or new timer-source/event table unless execution discovers that first-pass acceptance cannot be truthful without owner approval.
- Broad redesign of Habits cards, My Routines/Home entrypoints, analytics taxonomy, or Help/Guide beyond timer/manual wording and support impact.
- `Build` to `Do` habit-mode copy is deferred to a separate Habits copy slice because it affects all build habits, create/edit/details labels, tests, and support copy; the underlying canonical mode should remain `build` unless that future slice explicitly scopes a data-contract change.

## Acceptance Criteria

Planning acceptance for this brief:

1. Child B brief exists in `docs/task-briefs/in-progress/`.
2. Parent intake links this active child.
3. AW-006 queue and design inventory record Child B as in progress.
4. Fresh local code/test/API/schema audit is recorded.
5. Benchmark refresh sources are recorded.
6. Finding disposition lists every H-ID.
7. `npm run lint:briefs` passes for the changed planned brief set.

Execution acceptance after owner approval:

1. Timed habit card shows one clear daily total, not two competing timer truths.
2. Manual-time copy clearly means time done outside the app.
3. Restart/resume display includes saved server minutes plus current local timer seconds where both exist.
4. Starting a second timed habit pauses/switches from the first active timer and preserves elapsed local time.
5. Rest-day and completed-period rows still hide timer/manual controls.
6. Focused unit/component tests cover timer total, manual copy, one-active-timer behavior, localStorage recovery, save/reset/rest interactions, and any changed helper invariants.
7. Screenshot handoff is approved before `npm run verify:pre-pr`.
8. Parent return status, AW-006 queue, and design inventory are updated before closeout.

## Validation

Required now for this planning/docs update:

- `npm run lint:briefs`

Required during later execution:

- targeted Vitest for Habits domain/component tests, likely:
  - `./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx`
- route/label/support sweep terms above
- screenshot handoff before broad gates
- `npm run verify:pre-pr` before PR update/push
- required CI checks green
- `npm run verify:pre-merge` before merge recommendation

Completed during execution so far:

- `./node_modules/.bin/vitest run tests/unit/habits.test.ts tests/unit/habit-perfect-day-hub.test.tsx` PASS, 2 files / 53 tests after the final heading-pill/progress-module visual correction.
- `npx eslint components/my-library/habits/HabitPerfectDayHub.tsx tests/unit/habit-perfect-day-hub.test.tsx` PASS.
- `npm run typecheck` PASS.
- `npm run lint:briefs:all` PASS after queue wording avoided listing done brief links in the same metadata sentence as the active child.
- `git diff --check` PASS.
- route/label/support sweep PASS after updating support runbook and user-flow map; remaining old-label mentions are intentional historical/negative-test evidence.
- screenshot handoff captured under `output/aw006-habits-child-b-2026-06-04-085433` as after/reference evidence; local dev auth was blocked by the Supabase egress guard, so capture used a temporary deterministic harness that rendered the production `HabitPerfectDayHub` with fixture data; the harness was removed after capture and the scoped component/styles were not changed after capture.
- owner approved the refreshed screenshot handoff in chat on `2026-06-04`; only docs/brief text was updated after capture, so screenshot regeneration is not required before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-06-04 | planned | owner selected Child B from the Habits parent after PR #977/#978 and post-merge preflight green; created this planned brief with fresh code/API/schema/test and benchmark audit; sound is explicitly out of first pass | next: wait for explicit execute/build/implement before moving to in-progress or changing runtime code`
- `2026-06-04 | in-progress | owner explicitly said execute Child B; moved this brief to docs/task-briefs/in-progress/2026-06-04-aw-006-habits-timed-timer-manual-ux-10-10.md on branch aw-006-habits-timed-timer-manual-ux | next: implement timer/manual UX, run targeted validation, and capture screenshot handoff before npm run verify:pre-pr`
- `2026-06-04 | implemented + targeted validation | changed HabitPerfectDayHub timed habit behavior so displayed total is saved minutes plus local timer seconds, Finish saves that additive total, Manual time/Add manual time adds external minutes, starting another timed habit pauses the current local timer, and the duplicate standalone timer readout is removed; updated component tests plus support/user-flow docs; targeted Habits Vitest PASS (53 tests); route/label/support sweep PASS with old labels retained only as historical brief context and negative test assertions | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot handoff refreshed | captured after/reference desktop and mobile screenshots in output/aw006-habits-child-b-2026-06-04-085433 after moving Daily to the timed-card heading, removing redundant Timed/Logged collapsed pills, and replacing the old time chip with one progress module; screenshots show saved+local total, Manual time/Add manual time, removed duplicate timer box, and one-active-timer mobile state; local dev auth was blocked by the Supabase egress guard, so a temporary deterministic harness rendered the production HabitPerfectDayHub and was removed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot approved | owner approved refreshed screenshots in chat; recorded Build to Do mode-copy idea as a deferred follow-up outside Child B; no runtime/rendering files changed after screenshot capture | next: run npm run verify:pre-pr`
