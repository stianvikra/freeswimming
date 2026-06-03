# Task Brief: AW-006 Habits UX Findings Reconcile Parent/Intake (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `parent_type`: `intake/umbrella; no implementation until a child brief is selected`
- `execution_mode`: `plan only`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@9167998`
- `audit_status`: `ready`
- `decision`: Use this as the canonical parent/intake for the owner's Habits product, tracking, history, and UX findings before any Habits child implementation starts.
- `reason`: `main` is clean and synced after Checkout Button Token And Action Parity PR `#975` and repo-managed closeout PR `#976`; post-merge preflight was reported green with no active AW-006 product/UI slice selected. The owner provided multiple Habits findings after the Habits token/input/action parity baseline shipped in PR `#969`, and those findings need a durable parent brief plus return contract before scope is split into child briefs.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, habits API/storage/local timer contracts, cadence/check-in/timer behavior, My Routines/Home Habits entrypoints, Help/Guide/support rules, benchmark assumptions about habit apps, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before selecting a child brief.

## Goal

Capture all current Habits findings, external habit-app audit insights, scope grouping, and child-brief return rules so future Habits implementation does not depend on chat memory.

## Pre-Implementation Owner Explanation

Vi samler alle Habits-funnene i en egen parent-brief forst. Det betyr at problemer rundt manual time, streaks, rest day, weekly completion, timer-UX, historikk og kortlayout blir bevart som repo-sannhet for vi bygger.

Hvorfor det betyr noe: Habits er en motivasjonsflate, og sma feil i tracking kan gjore at brukeren mister tillit eller motivasjon. Parent-briefen gjor at vi kan velge riktige child-slices uten at funn faller ut.

Utenfor scope her er produktkode, databaseendringer, UI-endringer, screenshots, PR-sized implementering, merge, og beslutning om endelig datamodell. Dette dokumentet er plan/audit-grunnlaget.

Fremoverkompatibilitet: nye Habits-child briefs skal bruke denne parenten som kilde, oppdatere resolved/deferred status tilbake hit, og sikre at nye habit modes, labels, statuses, timer-kilder og historikkverdier enten flyter gjennom typed contracts/view-models eller krever eksplisitt mapping.

## Intake Findings

| ID    | Finding                                                                                                                                                                  | Current risk                                                                                                | Initial disposition                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| H-001 | Timed habit manual time should represent time done outside the app, and restart/resume should count today's total saved time plus current timer time.                    | Manual entry can feel separate from actual timer truth, causing undercounting or double-counting confusion. | Candidate child: Tracking Semantics or Timed Habits.                 |
| H-002 | Copy should prefer `Manual time` / `Add manual time` over unclear `Add time` when the user tracked with an external stopwatch or outside the app.                        | Ambiguous copy weakens trust in time totals.                                                                | Candidate child: Timed Habits.                                       |
| H-003 | Build/quit motivation should not collapse to only `0 days without` after a slip; show lifetime/period consistency such as `21/22 days` plus current streak.              | A single slip visually erases progress and can demotivate the user.                                         | Candidate child: Tracking Semantics.                                 |
| H-004 | Add a `Rest day` concept for sickness, travel, injury, or intentionally not doing a habit.                                                                               | Users need a truthful non-failure state that is not the same as done.                                       | Candidate child: Tracking Semantics; data decision required.         |
| H-005 | Optional small sound when a timer reaches today's target.                                                                                                                | Target reached can be missed while timer is running.                                                        | Candidate child: Timed Habits; local preference required.            |
| H-006 | Optional sound when marking a habit done.                                                                                                                                | Positive feedback is useful, but sound must not be intrusive.                                               | Candidate child: Timed Habits or later Preferences.                  |
| H-007 | Weekly habits should stay done for the rest of the period after the target is met.                                                                                       | User may see actions after the weekly goal is already satisfied.                                            | Candidate child: Tracking Semantics.                                 |
| H-008 | Last Habits card and contextual Admin notes spacing on mobile is too tight near the fixed bottom nav.                                                                    | Admin notes can feel visually jammed or partially hidden.                                                   | Candidate child: Mobile Polish; likely `SiteChrome` not Habits-only. |
| H-009 | Habits history/tracking should be audited against top habit apps before build.                                                                                           | Building a dashboard before data semantics are right can create rework.                                     | Parent gate: required before any child implementation.               |
| H-010 | Feature gap audit: rest/skip, backfill, consistency %, current/best streak, habit score, calendar/history, notes, undo, archive-keep-history, optional sound, reminders. | Missing features may keep Habits below 10/10 even if visual polish is good.                                 | Parent owns prioritization; child briefs own delivery.               |
| H-011 | Timed habit cards can appear to show two timers at once (`0:15 / 10:00 today` and a separate `0:15` timer box).                                                          | Duplicate timer display feels like two sources of truth.                                                    | Candidate child: Timed Habits/Card UX.                               |
| H-012 | Only one active Habits timer should run by default; starting another should pause/switch intentionally.                                                                  | Multiple running timers can double-count attention/time and feel unsafe.                                    | Candidate child: Timed Habits; product decision required.            |
| H-013 | Habit metadata chips (`Timed`, `Daily`, `Open`) should align away from the habit title where practical.                                                                  | Chips compete with the title and reduce scanability on cards.                                               | Candidate child: Card UX.                                            |
| H-014 | New owner findings may continue to arrive before implementation.                                                                                                         | Chat-only findings can be lost.                                                                             | Append here before selecting or executing a child.                   |

## External Habit-App Audit Snapshot

Use official or primary sources where possible when refreshing this audit.

| App/source                                                                                                                                                                                                                                                                                                                                       | Useful pattern                                                                                                                    | Why it matters for FreeSwimming Habits                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Streaks, `https://streaksapp.com/`                                                                                                                                                                                                                                                                                                               | Streaks are core, but schedules can be daily, specific weekdays, or weekly counts; some goals can be auto-tracked through Health. | Keep streaks, but make schedules explicit and avoid hard daily assumptions.                 |
| Habitify progress, `https://habitify.me/onboarding-instruction/progress`                                                                                                                                                                                                                                                                         | Progress is summarized by day/week/month/year and includes average completion, total completed, and skipped.                      | Our history should separate today, period, and long-range views.                            |
| Habitify streak/skip, `https://habitify.me/onboarding-instruction/start-a-streak` and `https://www.habitify.me/es/onboarding-instruction/use-skip`                                                                                                                                                                                               | Streaks are motivating, and Skip protects streaks when life interrupts.                                                           | Rest/skip should be a first-class non-failure state, not hidden in copy.                    |
| Productive stats/backfill/vacation, `https://support.productiveapp.io/hc/en-us/articles/26920754719633-How-to-read-statistics`, `https://support.productiveapp.io/hc/en-us/articles/26920673789585-How-to-mark-habits-for-previous-days`, `https://support.productiveapp.io/hc/en-us/articles/35968324455953-Vacation-mode-how-to-pause-a-habit` | Shows perfect days, current streak, totals, average per day; supports editing previous days and vacation mode.                    | Backfill, pause/rest, and multiple summary metrics are expected in strong habit products.   |
| Productive delete/history, `https://support.productiveapp.io/hc/en-us/articles/35968663947537-How-to-delete-habit-or-reset-data`                                                                                                                                                                                                                 | Can delete while keeping history.                                                                                                 | Archive/delete semantics must preserve user trust in history.                               |
| Loop Habit Tracker, `https://play.google.com/store/apps/details?id=org.isoron.uhabits&hl=en_US&gl=US`                                                                                                                                                                                                                                            | Combines streaks with habit strength score, detailed charts, complete history, flexible schedules, privacy, and export.           | Best inspiration for not letting one missed day erase all progress.                         |
| ChainIt, `https://www.chainit.store/`                                                                                                                                                                                                                                                                                                            | One-tap tracking, 365-day grid, edit previous dates, weekly/monthly/yearly metrics, local data/export.                            | Useful simple-history reference, but lower priority than the larger established apps above. |

## 10/10 Product Direction

- Primary motivation metric:
  - show consistency first, for example `21/22 days on track` or `95%`;
  - show `Current streak` and `Best streak` as secondary momentum;
  - for quit habits, show both lifetime consistency and current streak after slip recovery.
- Status model:
  - distinguish `done`, `partial`, `missed`, `rest`, `slip`, `manual time`, `timer time`, `backfilled`, and `archived`;
  - do not overload `skipped` to mean every non-done state.
- Timed habits:
  - one visible source of truth for today's total;
  - manual time is additive external time;
  - only one active timer by default unless a future brief explicitly chooses multi-timer behavior.
- History:
  - start with details/timeline and compact status chips before a heavy dashboard;
  - later add calendar/heatmap, period summaries, notes, and habit score.
- UI:
  - habit cards should be scan-first: title left, metadata grouped away from title, today's progress line under title, and one clear primary action;
  - mobile spacing must respect fixed nav and admin notes.
- Sound:
  - opt-in local preference only;
  - one short sound for target reached and mark done;
  - no sound for slip, reset, archive, undo, or destructive flows.

## Proposed Child Briefs

| Child                                                 | Suggested scope                                                                                                                                                                                                                                                                         | Must not include                                                                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Child A: Habits Tracking Semantics And Motivation     | Consistency copy, slip display, weekly/monthly done-period state, rest-day contract, current-streak contract where data proves it, status chips, required domain tests. Done in PR `#977`: `docs/task-briefs/done/2026-06-03-aw-006-habits-tracking-semantics-and-motivation-10-10.md`. | Full history dashboard, reminders, Apple Health/native integrations, best streak unless data sufficiency is proven. |
| Child B: Timed Habits Timer/Manual/Sound UX           | Manual time additive semantics, one active timer rule, duplicate timer display cleanup, target-reached/done sound preference if scoped safely.                                                                                                                                          | Streak/history overhaul unless Child A already landed.                                                              |
| Child C: Habits History And Insights                  | Habit details timeline, calendar/heatmap, backfill/edit previous days, notes per log, archive-keep-history, export/readability decisions.                                                                                                                                               | Timer behavior changes unless Child B owns them.                                                                    |
| Child D: Habits Mobile Polish And Admin Notes Spacing | Mobile spacing to contextual admin notes, fixed-nav safe-area spacing, metadata chip alignment/card scan hierarchy.                                                                                                                                                                     | Domain tracking semantics unless explicitly paired with Child A.                                                    |
| Child E: Habits Advanced Motivation                   | Habit score/strength, reminders/nudges, longer-range trend summaries, optional shareable snapshot/export.                                                                                                                                                                               | Core correctness fixes that should be done earlier.                                                                 |

Child A outcome: PR `#977` shipped `docs/task-briefs/done/2026-06-03-aw-006-habits-tracking-semantics-and-motivation-10-10.md`. The parent intake is again the return target; later Habits children require explicit owner selection after a fresh queue/design/code re-audit.

## Child Return Status

| ID    | Status after Child A  | Evidence / Next owner decision                                                                                                                                                                                  |
| ----- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-001 | Deferred              | Belongs to Child B Timed Habits because manual time/restart semantics are timer-source decisions.                                                                                                               |
| H-002 | Deferred              | Belongs to Child B Timed Habits with manual-time copy and timer UI.                                                                                                                                             |
| H-003 | Resolved              | PR `#977` shows consistency/streak motivation without collapsing slip recovery to only `0 days without`.                                                                                                        |
| H-004 | Resolved              | PR `#977` maps `Rest day` to existing skipped check-ins as a non-done, non-missed state with undo.                                                                                                              |
| H-005 | Deferred              | Belongs to Child B Timed Habits or Preferences because target-reached sound needs opt-in local preference scope.                                                                                                |
| H-006 | Deferred              | Belongs to Child B Timed Habits or Preferences because mark-done sound needs the same sound preference contract.                                                                                                |
| H-007 | Resolved              | PR `#977` keeps weekly/monthly target-met habits done for the rest of the period and removes redundant mark-done actions.                                                                                       |
| H-008 | Deferred              | Belongs to Child D Mobile Polish/Admin Notes Spacing.                                                                                                                                                           |
| H-009 | Satisfied for Child A | Child A refreshed Habits code, benchmark expectations, and data sufficiency before implementation; future children must repeat their own audit.                                                                 |
| H-010 | Partially resolved    | PR `#977` covers rest/skip, consistency %, and current streak where data proves it; backfill, best streak, habit score, calendar/history, notes, archive history, sound, reminders, and export remain deferred. |
| H-011 | Deferred              | Belongs to Child B Timed Habits/Card UX because duplicate timer display needs timer-source cleanup.                                                                                                             |
| H-012 | Deferred              | Belongs to Child B Timed Habits and requires a product decision on one-active-timer behavior.                                                                                                                   |
| H-013 | Partially resolved    | PR `#977` fixes scoped card metadata hierarchy for this motivation work; broader card/mobile polish remains a future child if still needed.                                                                     |
| H-014 | Ongoing               | Append any new owner findings here before selecting another child.                                                                                                                                              |

## Return Contract

Every Habits child brief created from this parent must include:

- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `resolved_findings`: exact H-IDs the child closes.
- `deferred_findings`: exact H-IDs intentionally left for later, with rationale.
- `return_checkpoint`: update this parent before the child is considered closeout-ready.
- `next_return_target`: after child merge/closeout, return to this parent to select the next Habits child or explicitly return to the broader AW-006 queue.

Child Definition of Done includes:

1. The child updates this parent intake with resolved/deferred status and the latest checkpoint.
2. The child updates the AW-006 canonical queue and design inventory with accurate active/done/no-active references.
3. The PR handoff includes `Return target: docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`.
4. Post-merge closeout keeps this parent as the next review point unless the owner explicitly chooses a non-Habits AW-006 slice.
5. No Habits child may be marked done while this parent still shows stale status for any H-ID it touched.

If a new owner Habits finding arrives before or during a child:

- append it to `Intake Findings` with the next H-ID;
- decide `same child`, `separate child`, `needs product decision`, or `defer`;
- do not rely on chat memory.

## Audit Gate Before Any Child Implementation

Before moving any child to `in-progress`, Codex must perform and record:

1. Local code audit:
   - `components/my-library/habits/HabitPerfectDayHub.tsx`
   - `lib/habits/shared.ts`
   - `lib/habits/server.ts`
   - `lib/habits/schema.ts`
   - `app/my-library/habits/page.tsx`
   - `components/SiteChrome.tsx` if admin-notes spacing is in scope
   - `components/my-library/TodayTabsPanel.tsx` and Home/My Routines entrypoints if cadence/done-period behavior is in scope
   - `tests/unit/habits.test.ts`
   - `tests/unit/habit-perfect-day-hub.test.tsx`
2. Benchmark refresh:
   - re-check official/primary sources above if the child changes feature scope, labels, history semantics, reminders, sounds, rest/skip, or backfill behavior.
3. Finding disposition:
   - every H-ID must be marked `in scope`, `deferred`, `blocked by product decision`, or `not affected`.
4. Data-boundary decision:
   - explicitly state whether each changed value is server-canonical, local-only, or derived view-model state.
5. Visual gate:
   - any UI/layout/card/timer/history change requires screenshot handoff before `verify:pre-pr`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim on this planning parent:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                    | Evidence                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | All Habits findings are captured, grouped into child-sized outcomes, and linked back to AW-006 without selecting implementation prematurely.                                          | this parent + AW-006 queue diff        | `5/5`                   |
| UX flow clarity                               | `target`     | Parent defines the intended user-visible direction for timer, manual time, rest/slip, weekly completion, card hierarchy, and history before build.                                    | intake matrix + proposed child scopes  | `5/5`                   |
| Visual design quality                         | `target`     | UI findings that require screenshots are explicitly tagged for child screenshot handoff and no visual change ships from this parent.                                                  | scope/out-of-scope + child visual gate | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Parent requires domain audit and data-boundary decisions before changing habit check-ins, cadence, timer totals, slip/rest, or history.                                               | audit gate + data contract             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this parent changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                                                     | explicit admin-editor scope rationale  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Any child UI change must preserve labels, keyboard flow, status semantics, focus visibility, contrast, and screenshot/a11y validation.                                                | child DoD requirements                 | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same child DoD requirement.                                                                                                | child DoD requirements                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: parent creates no runtime payload; child briefs must avoid unnecessary client growth and set route-level impact notes when UI changes.                               | parent out-of-scope + child gate       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Parent records required local/server/derived decisions for timers, manual time, sounds/preferences, rest/slip, history, and backfill before any child builds.                         | data placement section + child DoD     | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache changes here; child briefs must state mutation refresh/cache behavior for changed habits reads or writes.                                                   | child audit gate                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Parent requires deterministic behavior for offline/latency/retry and avoids ambiguous timer/manual/rest/slip states before implementation.                                            | audit gate + acceptance criteria       | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route or API changes here; child briefs touching habits APIs must preserve fail-closed auth and add negative-path tests where relevant.                 | child gate requirement                 | `4/5`                   |
| Privacy and compliance                        | `target`     | Habits can contain sensitive quit/health behavior; parent requires data minimization, local-only sound preferences, and no public/analytics leakage for future child changes.         | privacy contract + child DoD           | `5/5`                   |
| Content governance                            | `target`     | Parent, AW-006 queue, and design inventory become the durable source of truth for all current and future owner Habits findings.                                                       | docs diff + brief lint                 | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: mobile contextual admin notes spacing is captured, but no admin workflow labels or operator actions change in this parent.                                           | intake H-008 + scope rationale         | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and this parent changes no public metadata, sitemap, robots, canonical URL, or structured data.                             | private-route SEO rationale            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this parent changes no crawl-safe public entity model, structured data, AI-facing page copy, or public docs surface.                                                      | AI-discoverability scope rationale     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics changes here; child briefs that change habit actions/statuses must define safe event payload implications or explicit N/A.                              | child forward-compat gate              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this parent changes no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow.                                                          | commerce scope rationale               | `N/A`                   |
| Incident response and support operations      | `target`     | Parent requires Help/Guide/support impact decisions for workflow labels/recovery behavior and makes the return target visible in PR handoff.                                          | Return Contract + Help/Guide impact    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this parent changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation. | explicit finance scope rationale       | `N/A`                   |
| i18n operational readiness                    | `target`     | Parent requires child UI to avoid tight fixed-width assumptions for habit labels, chips, timer text, status copy, and longer localized strings.                                       | child visual/i18n gate                 | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Parent requires reusing existing Habits domain helpers, view-models, route boundaries, tests, and My Library tokens before introducing new abstractions/dependencies.                 | stack gate + child DoD                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Parent defines required unit/domain/screenshot/e2e gates for children and requires `npm run lint:briefs` for changed briefs.                                                          | validation + child DoD                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no runtime cost here; child scopes must avoid unnecessary storage/event bloat and document cost impact for history/timeline expansions.                              | child audit gate                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Parent is docs-only and rollback is normal git revert; child briefs must define migrations/flags/rollback if data semantics change.                                                   | git diff + child DoD                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `/my-library/habits` and `HabitPerfectDayHub` as the mature route/component reference.
  - Preserve authenticated route boundaries unless a child explicitly scopes route/server loader changes.
  - Use a shared Habits view-model/helper before scattering status labels across JSX.
- TypeScript/domain contracts:
  - Audit `HabitDefinitionView`, `HabitCheckInView`, `HabitDayItem`, `HabitEvaluation`, cadence helpers, timer helpers, and check-in payload validation before data behavior changes.
  - Future child briefs must define explicit invariants for rest/slip/manual/backfill/status totals.
- Supabase/data layer:
  - Parent makes no data changes.
  - Child briefs that add persistent status/source/reason/history fields must use explicit migrations, RLS/authz review, generated type updates, and negative-path tests.
- External services/tools:
  - N/A for parent.
  - Do not add external habit services, analytics vendors, HealthKit/native integrations, or sound libraries without a dedicated child rationale.
- UI system:
  - Reference surfaces: current token-backed `/my-library/habits` after PR `#876/#877`, `HabitPerfectDayHub` inner parity after PR `#969`, My Library token/action classes, `fs-cta-*`, `fs-library-card`, `ui-field`, and mobile action layout contract.
  - Child UI changes require before/after or after/reference screenshots.
- Testing:
  - Domain tests for cadence, slip/rest, streak/consistency, manual/timer totals, and history status derivation.
  - Component tests for card labels/actions, timer controls, details/history, and accessible status output.
  - Playwright/screenshot handoff for changed mobile/desktop Habits surfaces.

## Data Placement And Sync Contract

This parent changes no data. It defines required decisions for child briefs:

- Server-canonical data:
  - habit definitions;
  - daily/period check-ins;
  - persisted rest/slip/manual/backfill/history states if implemented;
  - any user-visible historical truth used across devices.
- Local data:
  - running/paused timer state while not saved;
  - sound preference if scoped as local-only;
  - transient expanded row/details UI state.
- Derived view-model data:
  - current streak;
  - best streak;
  - consistency percentage;
  - weekly/monthly target-met state;
  - displayed total time from saved manual time plus timer time.
- Sync policy:
  - child briefs must define whether writes are additive, overwriting, idempotent, or append-only;
  - local timer state is not server truth until saved;
  - backfill must not create data before habit start date unless an explicit migration/import scope allows it.
- Retention and sensitivity:
  - habit names, quit/slip data, notes, and health-adjacent behavior are private user data;
  - do not leak values to public pages, logs, or analytics payloads.
- Cache/invalidation:
  - changed mutation paths must refresh the Habits snapshot deterministically and avoid stale card/history totals.

## Identity And Rename Contract

- Canonical stable ID:
  - habit rows are identified by stable habit IDs across definitions, check-ins, timers, history, notes, and future exports.
- Human-readable identifiers:
  - habit title is user-editable and not a stable identity key.
  - mode/type/cadence labels are display labels derived from typed contracts, not identity.
- Mutability rules:
  - editing a habit keeps existing history attached unless a future child introduces explicit versioning.
  - materially repurposing a habit, for example changing `Quit sugar` into `Read pages`, should be treated as a product decision before history is reused.
- Compatibility contract:
  - child briefs that add status/source fields must define fallback behavior for existing check-ins.
  - unknown legacy status values must not render as success.
- Observability and repair:
  - child briefs touching persistence must document how support can diagnose a user-visible mismatch between check-in rows, timer state, and displayed history.

## Forward Compatibility Contract

- Extensibility surfaces:
  - habit modes, habit types, cadence periods, cadence day policies, status labels, timer sources, manual sources, rest/slip reasons, history event types, row actions, Help/Guide labels, analytics payload values, and future export fields.
- Source of truth:
  - future visible labels should derive from typed contracts/view-model helpers rather than repeated route-local strings.
  - future history should derive from server-canonical check-ins/events plus documented local-only timer state.
- Additive behavior:
  - new habit rows returned by existing contracts should inherit card layout, status chips, and details behavior.
  - new status/event types should fail visibly as unknown/not-counted until mapped.
- Explicit mapping requirements:
  - new habit modes, destructive actions, workflow labels, event types, timer source types, rest/slip reason taxonomies, backfill semantics, reminders, exports, analytics values, or native integrations require explicit mapping, tests, and Help/Guide/support review.
- Unknown or deprecated values:
  - fail closed for data truth; do not count unknown values as done, target-met, or streak-protecting without mapping.
- Test/evidence:
  - child briefs must include at least one future/unknown value fixture or explicit N/A rationale when they touch status/type/action mapping.

## Help / Guide Impact

Parent is docs-only and changes no Help/Guide content.

Child briefs must update Help/Guide or relevant runbooks in the same PR if they change:

- visible workflow labels;
- habit action meanings;
- rest/skip/slip/manual/backfill behavior;
- timer recovery behavior;
- support diagnosis paths;
- archive/delete/history semantics.

If a child does not affect Help/Guide, it must state the N/A rationale explicitly.

## Route / Label / Support Surface Sweep

Future child briefs must run the route/label/support sweep before broad gates when changing any habit label, action, route, recovery path, Help/Guide assertion, or operator-visible support surface.

Minimum search terms:

- `/my-library/habits`
- `HabitPerfectDayHub`
- `Manual min`
- `Save manual`
- `Log slip`
- `days without`
- `Done this week`
- `done_period`
- `Rest day`
- `Skipped`
- `Finish`
- `Reset`
- `Details`
- `Archive`
- `TodayTabsPanel`
- `AdminContextNotesPanel`

Minimum surfaces:

- `app/`
- `components/`
- `lib/habits/`
- `tests/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- Help/Guide assertions when workflow copy changes.

## Scope

- Create and maintain this parent/intake brief.
- Record all current owner Habits findings from this chat.
- Record external habit-app audit insights and sources.
- Define proposed child grouping and first-child recommendation.
- Define Return Contract and audit gate before any child implementation.
- Link this parent from the AW-006 canonical queue and design inventory.

## Out Of Scope

- Runtime code changes.
- Database migrations.
- UI changes.
- Screenshot capture.
- Creating child briefs.
- Selecting or executing the first child implementation.
- Updating Help/Guide content.
- Changing Habits data model, API routes, timer behavior, check-in behavior, cadence rules, analytics, Home/My Routines behavior, or admin notes rendering.
- Committing, pushing, opening PR, or merge flow unless separately requested.

## Acceptance Criteria

1. Parent/intake brief exists in `docs/task-briefs/planned/`.
2. Every current owner-provided Habits finding from this chat is captured with an H-ID.
3. External benchmark sources and 10/10 direction are recorded.
4. Proposed child briefs and recommended first child are listed.
5. Return Contract makes parent update mandatory before any child closeout.
6. AW-006 canonical queue links this parent without marking an implementation child active.
7. Design inventory links this parent as planned intake without claiming runtime behavior shipped.
8. `npm run lint:briefs` passes for the changed brief set.

## Validation

Required for this docs-only parent/intake creation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`

Not required for this parent-only docs update:

- screenshot handoff;
- `npm run verify:pre-pr`;
- `npm run verify:pre-merge`;
- PR creation.

Child briefs must define their own validation lane based on whether they touch docs, UI, runtime logic, APIs, tests, migrations, or support surfaces.

## Checkpoint Log

- `2026-06-03 | planned | created parent/intake after owner finished the first Habits findings batch and explicitly requested a Return Contract; base main@9167998 after PR #975 and closeout #976; no implementation child is selected | next: run brief lint, then wait for owner instruction to create or execute the first child brief`
- `2026-06-03 | planned | selected Child A as the recommended first child and created docs/task-briefs/planned/2026-06-03-aw-006-habits-tracking-semantics-and-motivation-10-10.md with audit_status revise-before-use; no implementation has started | next: owner may explicitly execute the child, which must first refresh local code/benchmark audit before moving to in-progress`
- `2026-06-03 | in-progress | owner said execute Child A; moved the child to docs/task-briefs/in-progress/2026-06-03-aw-006-habits-tracking-semantics-and-motivation-10-10.md on branch aw-006-habits-tracking-semantics; touched H-003/H-004/H-007 and partial H-010 while H-001/H-002/H-005/H-006/H-008/H-011/H-012/H-013 and remaining H-010 features stay deferred | next: child must update exact resolved/deferred H-ID status before closeout, then return here after merge/closeout`
- `2026-06-03 | in-progress | Child A has local implementation, targeted validation, support/queue/inventory updates, and before/after screenshot artifacts at output/aw-006-habits-tracking-semantics-2026-06-03-235229; visual approval is the required stop before npm run verify:pre-pr, commit, push, and PR | next: after owner approves screenshot handoff, continue Child A automation and return here again before closeout`
- `2026-06-04 | in-progress | Child A incorporated owner screenshot feedback: open daily build rows now expose data-backed streak/consistency without Details and metadata chips no longer leave Open as a loose broken line; refreshed artifacts are at output/aw-006-habits-tracking-semantics-2026-06-04-001220 | next: wait for owner visual approval, then continue Child A automation and return here again before closeout`
- `2026-06-04 | in-progress | Child A incorporated second owner screenshot feedback: slip status is not duplicated between chip/body, mobile pills are grouped under title, desktop pills remain right-aligned, and Current streak is hidden below 5 days; final refreshed artifacts are at output/aw-006-habits-tracking-semantics-2026-06-04-002231 | next: wait for owner visual approval, then continue Child A automation and return here again before closeout`
- `2026-06-04 | in-progress | Child A incorporated third owner screenshot feedback: collapsed build motivation stays visible, but Details no longer repeats the same streak/consistency line; refreshed artifacts are at output/aw-006-habits-tracking-semantics-2026-06-04-002920 | next: wait for owner visual approval, then continue Child A automation and return here again before closeout`
- `2026-06-04 | in-progress | Child A incorporated fourth owner screenshot feedback: desktop pills now sit immediately after the habit name, mobile collapsed pills show cadence plus meaningful day state while Build/Quit/Open move to Details, and collapsed motivation chooses either streak or consistency instead of both; refreshed artifacts are at output/aw-006-habits-tracking-semantics-2026-06-04-004406 | next: wait for owner visual approval, then continue Child A automation and return here again before closeout`
- `2026-06-04 | returned | Child A shipped in PR #977 as squash commit 7ef85d7 and returned exact H-ID status to this parent; no Habits child is active, with H-001/H-002/H-005/H-006/H-011/H-012 pointing to Timed Habits, H-008 to Mobile Polish, and remaining H-010 to History/Insights or Advanced Motivation | next: complete repo-managed docs-only closeout PR, rerun post-merge preflight, then choose the next Habits child only after fresh audit and owner instruction`
