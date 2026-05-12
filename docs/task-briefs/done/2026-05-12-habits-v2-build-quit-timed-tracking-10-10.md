# Task Brief: Habits V2 Build Quit Timed Tracking (10/10)

## Metadata

- `id`: `2026-05-12-habits-v2-build-quit-timed-tracking-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-12`
- `updated`: `2026-05-12`
- `execution mode`: `end-to-end implementation after owner explicitly asked to execute/build/implement`

## Goal

Upgrade `My Perfect Day` habits into a clearer, best-practice habit tracker that supports building habits, quitting habits, and timed habits without forcing every habit into daily ticking.

## Product Decision

Habits V2 should use three user-facing modes:

- `Build`: positive habits the user wants to do, such as `Drinking water each morning`, `Read 10 pages`, or `Mobility 8 minutes`.
- `Quit`: behaviors the user wants to stop, such as `Eating chips`, `Doomscrolling`, or `Smoking`.
- `Timed`: duration-based build habits where a timer is the best input, such as `Read 10 minutes`, `Meditate 5 minutes`, or `Mobility 8 minutes`.

The core rule:

- For `I quit eating chips 3 days ago`, show `3 days without eating chips`; do not require a daily tick to keep the habit alive.
- For `I started drinking water each morning 1 day ago`, use daily check-in, optionally with amount; start date/backfill can seed the initial streak.
- For `Read 10 minutes`, `Mobility`, or `Meditation`, allow a timer that saves actual duration.

## Garmin Differentiation And Integration Boundary

This slice should differentiate Freeswimming from Garmin rather than compete with Garmin.

- Garmin is the future source for imported training facts such as swims, duration, distance, pace, heart-rate-adjacent metrics, and completed activities.
- Freeswimming habits are the user's behavioral layer: intentions, routines, quit goals, recovery cues, nutrition-adjacent routines, and small daily actions that Garmin does not understand well.
- Garmin-imported facts may later auto-complete or enrich relevant training habits, such as `Swim today`, `Dryland done`, or `20 minutes mobility`, but they should not become the identity model for private habit goals.
- Habit history must preserve human-entered context even when a future Garmin import confirms or contradicts a training completion.
- This V2 brief should not build Garmin sync; it should keep the data model ready for later import by separating external training events from first-party habit definitions, quit events, and timer/check-in facts.

## Competitive And Research Baseline

- Streaks supports negative tasks for breaking habits and timed tasks.
- Habitify supports building and quitting routines, focus timers, progress views, widgets, health integrations, and challenges.
- Strides supports multiple tracker types for habits, averages, targets, and milestone/project goals.
- Loop emphasizes flexible schedules, streaks, detailed charts, privacy, and a habit score that softens the all-or-nothing streak model.
- Habitica distinguishes positive, negative, and mixed habits, but its penalty-heavy mechanics are not the right tone for Freeswimming.
- Behavior-change research supports self-monitoring, goal setting, prompts/cues, feedback, implementation intentions, and positive reinforcement as the common baseline for digital habit formation.

References:

- https://apps.apple.com/us/app/streaks/id963034692
- https://apps.apple.com/us/app/habitify-habit-tracker/id1111447047
- https://apps.apple.com/us/app/strides-habit-tracker-goals/id672401817
- https://play.google.com/store/apps/details?id=org.isoron.uhabits
- https://habitica.fandom.com/wiki/Habits
- https://pmc.ncbi.nlm.nih.gov/articles/PMC11161714/

## Dependencies And Reference Surfaces

- Existing habits foundation:
  - `docs/task-briefs/done/2026-05-08-training-stats-and-habits-foundation-10-10.md`
  - `components/my-library/habits/HabitPerfectDayHub.tsx`
  - `lib/habits/shared.ts`
  - `lib/habits/server.ts`
  - `app/api/my-library/habits/`
  - `supabase/migrations/20260510153000_habits_perfect_day_foundation.sql`
- My Library IA reference:
  - `docs/task-briefs/done/2026-05-11-my-library-routines-entrypoint-and-training-ia-cleanup-10-10.md`
  - `docs/user-flow-map.md`
  - `docs/runbooks/auth-account-support.md`
- Quality reference:
  - `docs/quality/platform-10-10-scorecard.md`

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
- Accessibility (a11y)
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can choose `Build`, `Quit`, or `Timed` from habit creation and understand which tracking model fits their intent before saving.                                          | UX review + screenshot handoff + e2e creation flows        | `5/5`                   |
| UX flow clarity                               | `target`     | A user can add `I quit eating chips 3 days ago`, add `I started drinking water each morning 1 day ago`, and start/finish a timed habit without reading docs.                   | Playwright flow + owner screenshot QA                      | `5/5`                   |
| Visual design quality                         | `target`     | Habit rows show title, mode, current status, seven-day/since context, and one primary action with no cramped mobile layout or color-only meaning.                              | before/after screenshot handoff across mobile and desktop  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Quit start dates, lapse logs, build check-ins, timer sessions, backfill, resets, and derived streak/days-since summaries are deterministic and idempotent.                     | domain tests + API tests + reconciliation fixtures         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes authenticated user habit tracking, not admin content editing or publish workflows.                                                              | explicit scope rationale                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Mode controls, timer controls, lapse logging, reset, and charts/history have semantic labels, keyboard access, focus states, and text equivalents.                             | a11y assertions + keyboard QA + screenshot review          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library/habits` keeps route payload modest, adds no heavy chart/timer dependency, and keeps authenticated route interactions responsive under normal latency.             | dependency diff + build/perf gate + interaction QA         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Habit definitions, daily check-ins, quit events, timer sessions, and derived summaries have explicit server/local ownership and conflict behavior.                             | data contract review + unit/API tests                      | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Habit summaries refresh after create, edit, check-in, lapse, timer finish, reset, archive, and selected-date changes without stale status.                                     | route/cache review + e2e refresh checks                    | `5/5`                   |
| Reliability and failure handling              | `target`     | Offline, failed timer finish, duplicate submits, invalid dates, and partial API failure produce recoverable states without corrupting history.                                 | negative-path tests + manual offline/latency QA            | `5/5`                   |
| Security and authz                            | `target`     | All habit definition, quit event, timer session, and check-in reads/writes are authenticated, owner-scoped, fail closed, and input-validated.                                  | RLS/API negative-path tests                                | `5/5`                   |
| Privacy and compliance                        | `target`     | Sensitive habit labels and lapse details stay private, are excluded from unnecessary logs/events, and remain covered by export/delete expectations.                            | payload/log review + user export/delete impact review      | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: habit names and notes are user-authored private content; no admin publishing workflow is introduced.                                                          | model review                                               | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because there is no admin CRUD, moderation queue, or operator edit workflow in this slice.                                                                                 | explicit scope rationale                                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is authenticated/private and this slice changes no public metadata, sitemap, robots, or crawlable pages.                                      | explicit scope rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice creates no public AI-discoverable content, structured data, or crawl-safe knowledge page.                                                               | explicit scope rationale                                   | `N/A`                   |
| Analytics and KPI observability               | `target`     | First-party events can measure mode adoption, create success, check-ins, lapses, timer completion, resets, and archive without sending sensitive labels or notes.              | event taxonomy review + analytics payload tests            | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, subscription, entitlement, refund, payout, or revenue operation.                                                          | explicit scope rationale                                   | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose missing/stale habit definitions, quit days, lapse history, timer sessions, duplicate logs, and schema rollout issues without asking for sensitive labels. | runbook/help update + support diagnostics checklist        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because private habit tracking has no finance, payout, invoice, subscription, entitlement, reconciliation, or revenue-reporting impact.                                    | explicit scope rationale                                   | `N/A`                   |
| i18n operational readiness                    | `target`     | Mode labels, date/days-since copy, pluralization, units, timer duration, and lapse copy use locale-ready formatting and avoid schema-coupled English strings.                  | copy review + date/unit formatting tests                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js App Router, TypeScript domain helpers, Supabase migrations/RLS, and current UI primitives; add no dependency unless proven necessary.                     | architecture review + dependency diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit, API, component, Playwright, screenshot, and negative-path coverage protect build/quit/timed creation and logging paths.                                                  | targeted tests + `verify:pre-pr` + `verify:pre-merge`      | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Queries remain bounded to active habits and relevant date windows; timer/check-in/lapse writes stay one-row-per-event with indexed owner/date reads.                           | index/query review + load-shape rationale                  | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Schema changes are forward-safe, generated types are updated, old V1 habits remain readable, and rollback/degrade behavior is documented.                                      | migration review + rollback notes + pre-pr/pre-merge gates | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/habits` as the primary route.
  - Reuse the existing `HabitPerfectDayHub` data shape where practical, but split smaller subcomponents only when it reduces complexity.
  - Keep server loading in `app/my-library/habits/page.tsx`; keep timer interaction client-side and persist only completed/paused session facts through authenticated APIs.
  - Use no-store/dynamic behavior consistent with current authenticated My Library routes.
- TypeScript/domain contracts:
  - Extend `HabitDefinitionView`, check-in/event types, and summary builders in `lib/habits/shared.ts`.
  - Add deterministic helpers for `build`, `quit`, `limit`, and `timed` evaluation.
  - Validate dates, timezone, durations, units, numeric values, and mode transitions before writes.
- Supabase/data layer:
  - Prefer additive migrations over mutating the shipped V1 table shape destructively.
  - Add mode/event/session columns or child tables only with RLS, owner-scoped indexes, generated DB type updates, and negative-path tests.
  - Preserve existing V1 habits and check-ins as readable.
- External services:
  - No external reminders, HealthKit, Garmin, social, or analytics vendor integration in this slice.
  - First-party analytics only, with sensitive label redaction.
- UI system:
  - Reference surface: current `My Perfect Day` hub and My Library routines surfaces.
  - Use clear segmented mode selection, icon buttons for timer controls, compact status chips, and accessible progress/history text.
  - Screenshot handoff is required because this is user-facing UI.
- Testing:
  - Domain tests for days-since, lapse, build streak, timer duration, and summary math.
  - API/RLS negative-path tests for owner scope and malformed inputs.
  - Component tests for mode-specific creation and row actions.
  - Playwright for create/log/reset/archive happy paths and critical failure states.

## Data Placement And Sync Contract

- Server-canonical:
  - habit definitions, mode, schedule, start date, target values, units, target time, timer settings, active/paused/archived status,
  - build check-ins, quit/lapse events, timer sessions, manual corrections, check-in dates, timezone, and source metadata,
  - derived daily/weekly/days-since summaries rebuilt from canonical facts.
- Local-only:
  - open composer state, unsaved form values, selected mode before save, transient active timer display ticks, local selected date, optimistic pending state, and temporary error banners.
- Sync policy:
  - create/edit/check-in/lapse/timer-finish writes are server-canonical after successful API response,
  - duplicate same-day build check-ins update the same habit/date row,
  - quit lapse events are explicit events and do not silently rewrite the original quit start date unless the user chooses a reset action,
  - timer sessions should persist completed duration; active in-browser timer ticks may be local until pause/finish/save.
- Conflict policy:
  - invalid start dates, future quit dates, overlapping active timer sessions, or conflicting mode conversions fail closed with user-visible recovery copy,
  - materially changing a habit from quit to build or changing the core behavior should create a new habit unless the edit is a clear label/target correction.
- Retention and sensitivity:
  - habits, quit targets, lapses, and notes are private personal data,
  - logs/events must not include raw sensitive habit names or notes,
  - export/delete behavior must include any new event/session tables.
- Cache/invalidation:
  - all mutations return a fresh snapshot or trigger route refresh for the affected selected date and summary window,
  - archive/reset/lapse/timer finish invalidates daily summary, weekly summary, days-since state, My Library routines summary, and export payload state where relevant.

## Identity And Rename Contract

- Canonical stable ID:
  - each habit retains an immutable `habit_id`,
  - each quit/lapse/timer event receives its own immutable event/session ID if a child table is introduced.
- Human-readable identifiers:
  - habit title, notes, category, and display labels are editable presentation fields and are not route params.
- Mutability rules:
  - label/category/note edits may happen in place,
  - target threshold edits may happen in place when they are clearly the same behavior with corrected parameters,
  - mode or meaning changes that reinterpret history should create a new habit identity.
- Rename vs repurpose policy:
  - rename `Drink water` to `Drink water each morning` in place,
  - create a new habit for `Quit chips` if the old habit was `Drink water`, or if the behavior changes so prior logs no longer mean the same thing.
- Compatibility contract:
  - V1 `binary`, `count`, `duration`, `time_of_day`, and `avoidance` habits remain readable and are mapped into V2 display without mandatory migration.
  - Any generated aliases or legacy mode inference must be deterministic and covered by tests.
- Observability and repair:
  - support diagnostics should detect missing schema, orphan events, duplicate same-day rows, invalid timer sessions, and impossible days-since states without exposing raw labels.

## Scope

- Create or update the active task brief lifecycle when implementation starts.
- Add `Build`, `Quit`, and `Timed` habit creation/editing flows.
- Add days-since status for quit habits with explicit start date and lapse logging.
- Add optional start date/backfill for build habits so users can seed `started 1 day ago`.
- Add timer start/pause/finish/save behavior for duration habits only.
- Add mode-aware habit rows and compact history/readability improvements.
- Add compact returning-user rows: build habits show title/status and quick `Done`/`Undo`; timed habits show title/status/timer and `Start`/`Pause`; quit habits show title/status/days-since with lapse actions kept in details.
- Clarify goal period in the row UI: habit cadence chips show whether the habit target is `Daily`, `Weekly`, or days/week; timed habits show daily progress such as `0:00 / 8:00 today`; weekly summary cards are labeled as `7-day` report rollups.
- Extend weekly/current summary so build, quit, limit, and timed facts read correctly.
- Update user export/delete coverage if new tables/fields are introduced.
- Update support/runbook/help guidance for quit habits, timer failure recovery, reset behavior, and privacy.
- Add targeted tests and screenshot handoff.

## V2 Final Follow-Up Candidates

These are good follow-ups after the first V2 implementation proves the core model. They should not block the first V2 PR unless the implementation reveals they are needed for correctness.

- Better edit, pause, resume, archive, and restore flows for existing habits.
- Small starter templates for common swimming-adjacent routines:
  - water,
  - mobility,
  - sleep/wake consistency,
  - chips/sugar/soft-drink quit goals,
  - reading/learning,
  - dryland/micro-session support habits.
- Habit detail/history view for one habit with logs, lapses, notes, timer sessions, and corrections.
- More polished summary language after screenshot QA and owner feedback.
- Optional `limit` presentation improvements if avoidance habits need clearer copy than `Quit`.

## V3 Deferred Candidates

These are intentionally deferred beyond the first V2 implementation because they add integration, notification, analytics, or coaching complexity.

- Reminders, cues, and habit stacking prompts.
- Garmin-imported activity auto-complete for training habits.
- Habit score, long-range trends, heatmaps, and monthly reports.
- AI habit recommendations, coaching, and retrospective habit/training insight.
- Apple Health, Strava, Fitbit, or other wearable/app integrations.
- Native mobile widgets, app shortcuts, or push-notification actions.
- Social challenges, accountability groups, friends, or leaderboards.
- Public/admin habit analytics dashboards.

## Out Of Scope

- Push/email/SMS reminders.
- Apple Health, Garmin, Fitbit, Strava, or wearable sync.
- Social challenges, friends, leaderboards, penalties, or shame mechanics.
- AI-generated habit recommendations or coaching conclusions.
- Full analytics dashboard or long-range habit report center.
- Native mobile widgets.
- Entitlement, pricing, or subscription changes.

## Acceptance Criteria

1. User can create a quit habit from `I quit eating chips 3 days ago`; the habit shows `3 days without` on the correct local date basis.
2. User can log a lapse for a quit habit; days-since and history update without deleting the original history.
3. User can create a build habit from `I started drinking water each morning 1 day ago`; the habit can show seeded progress and still expects normal check-ins going forward.
4. User can create a timed duration habit, start/pause/finish a timer, and save actual duration as a check-in.
5. Timer controls are not shown for quit, binary, count, or time-of-day habits unless the habit is duration-based.
6. V1 habits remain visible and actionable after any migration.
7. Summary math distinguishes build completion, quit days-since, avoidance/limit target, and timed duration facts.
8. Offline/failed writes do not corrupt check-ins, lapses, or timer sessions.
9. Habit events and analytics do not include raw sensitive habit labels or notes.
10. Support docs explain how to diagnose stale summaries, missing schema, duplicate logs, quit-date mistakes, and timer recovery.
11. New habits show full details the first time; returning visits collapse known rows to the fastest safe action/status surface while preserving accessible details expansion.
12. Users can tell that timed habit targets are daily/scheduled goals and that `7-day minutes` / `7-day count` are weekly report rollups, not weekly goals.
13. Screenshot handoff covers mobile and desktop before `verify:pre-pr`.
14. Changed brief passes `npm run lint:briefs`; implementation PR passes `npm run verify:pre-pr` and `npm run verify:pre-merge`.

## Validation

- `npm run lint:briefs`
- Targeted unit tests for habit domain helpers:
  - days-since / quit start date,
  - lapse event evaluation,
  - build start-date/backfill,
  - timer duration math,
  - V1 compatibility mapping.
- Targeted API/RLS tests for:
  - unauthenticated and cross-user access,
  - malformed dates/durations,
  - duplicate same-day writes,
  - invalid mode transitions.
- Targeted component tests for:
  - create mode selection,
  - mode-specific row actions,
  - timer controls,
  - reset/lapse copy.
- Playwright:
  - `/my-library/habits` create/log/reset/archive flows for build, quit, and timed habits,
  - mobile and desktop route smoke,
  - accessibility-critical keyboard path.
- UI screenshot handoff:
  - `before/after` screenshots for `/my-library/habits` mobile and desktop where same-state capture is practical,
  - `after/reference` screenshots are acceptable for deterministic seeded states that compare V2 against the V1 build-only surface,
  - include changed create form, habit rows, quit status, and timer state,
  - owner approval before `verify:pre-pr`.
- Full gates:
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`

## Gate Evidence Notes

- API/server failure-mode evidence: route and domain tests cover unauthenticated access, malformed habit IDs, invalid dates/durations, before-start check-ins, duplicate same-day writes, quit slip/reset behavior, schema-not-ready handling, and owner-scoped unknown habits. Known invalid user input returns deterministic `400`, `401`, `404`, or `503` responses through validated branches; no unexpected 500 path is expected for validated habit create/check-in/export inputs.
- UI/export screenshot evidence: screenshot handoff followed `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; the actual consumed artifact is the full-resolution PNG set in `output/habits-v2-build-quit-timed-cadence-2026-05-12-132000`, with Playwright assertions for the changed cadence/timer labels before capture. Dev-overlay and fixed mobile-nav capture artifacts were handled in temporary capture code only, then removed before final diff. No high-cost debug log entry is required because the capture artifact issue did not survive repeated product fixes and did not change production rendering code.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/habits`
  - mobile viewport, tablet viewport, desktop Chromium, and desktop WebKit/Safari where practical.
- Vercel preview:
  - authenticated owner account on `/my-library/habits`,
  - create one build habit, one quit habit, and one timed habit,
  - verify no raw sensitive labels appear in analytics/log evidence.
- Screenshot artifacts:
  - required because UI/layout behavior changes,
  - filenames must use `before-<surface>-<viewport>.*` and `after-<surface>-<viewport>.*`, or `after-<changed-surface>-<viewport>.*` and `reference-<comparison-surface>-<viewport>.*` when comparing deterministic V2 seeded states to a separate reference surface.

## Help / Guide Impact

Required in the implementation PR:

- Update `docs/runbooks/auth-account-support.md` with:
  - quit habit days-since diagnostics,
  - lapse/reset distinction,
  - timer save/recovery guidance,
  - privacy guidance for sensitive habit names.
- Update any Help/Guide assertions if user-facing help copy changes.
- Update `docs/user-flow-map.md` if labels, entrypoints, or My Library IA changes.

## Route / Label / Support Surface Sweep

Run before broad verification if implementation changes labels or workflow actions.

Search at minimum:

- `Habits`
- `My Perfect Day`
- `Build`
- `Quit`
- `Timed`
- `Timer`
- `Days since`
- `Avoid/limit`
- `Check-in`
- `Lapse`
- `Reset`
- `/my-library/habits`

Surfaces:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs
- Help/Guide assertions when relevant

## Checkpoint Log

- `2026-05-12 | planning | created planned Habits V2 brief after owner asked whether habits should support timers, quit tracking, and start-date based progress; decision: use build/quit/timed modes rather than forcing every habit into daily ticking | next: owner decides whether to execute this brief end-to-end or adjust scope first`
- `2026-05-12 | implementation started | moved brief to in-progress on branch habits-v2-build-quit-timed after owner explicitly said execute/build/implement | base commit: 1609be2 docs: close micro sessions copy cleanup brief (#685) | next: inspect current habits schema, domain helpers, API routes, UI, and tests before scoped implementation`
- `2026-05-12 | implementation checkpoint | added additive Habits V2 schema fields, domain support for build/quit/timed modes, quit lapse handling, timer/manual duration check-ins, export coverage, support docs, and targeted tests | validation so far: npm run typecheck PASS; targeted Vitest for habits/routes/component/export/My Library today PASS (21 tests) | next: run route/label/support sweep, lint, capture screenshots, then stop for owner screenshot approval before pre-PR gate`
- `2026-05-12 | screenshot checkpoint | completed route/label/support sweep, added redacted habit analytics events, fixed timed-row initial timer state found during screenshot QA, captured after/reference artifacts in output/habits-v2-build-quit-timed-2026-05-12-093940, removed temporary preview/capture code from the PR diff | validation: npm run lint PASS; npm run typecheck PASS; targeted Vitest habits/routes/component/export/My Library today/analytics PASS (25 tests); npm run lint:briefs:all PASS | next: owner reviews screenshot handoff before verify:pre-pr, commit, push, and PR automation`
- `2026-05-12 | compact-row follow-up | implemented returning-user compact rows after owner clarified the desired quick surface: passive/automatic habits show heading and time/status, click-required build habits show heading and Done/Undo, and known rows collapse after first visit while details remain accessible | validation: targeted HabitPerfectDayHub test PASS; targeted Vitest habits/routes/component/export/My Library today/analytics PASS (27 tests); npm run lint PASS; npm run typecheck PASS; npm run lint:briefs:all PASS | next: regenerate screenshot artifacts for the updated compact-row UI and stop for owner visual approval before verify:pre-pr`
- `2026-05-12 | updated screenshot checkpoint | captured refreshed compact-row after/reference artifacts in output/habits-v2-build-quit-timed-compact-2026-05-12-125608 covering desktop returning compact, desktop first-use expanded, desktop timer running, mobile returning compact, and build-only reference; removed temporary preview/capture code and stopped local dev server | validation unchanged since compact-row follow-up; no product rendering files changed after this capture | next: owner reviews screenshot handoff before verify:pre-pr, commit, push, and PR automation`
- `2026-05-12 | cadence clarity follow-up | after owner asked whether the mobility timer goal was daily or weekly, updated UI copy so habit rows show cadence chips, timed rows show daily progress against target, and weekly metric cards are explicitly labeled as 7-day rollups | validation: targeted Vitest habits/routes/component/export/My Library today/analytics PASS (27 tests); npm run lint PASS; npm run typecheck PASS; npm run lint:briefs:all PASS | screenshot artifacts: output/habits-v2-build-quit-timed-cadence-2026-05-12-132000; temporary preview/capture code removed and local dev server stopped | next: owner reviews refreshed screenshot handoff before verify:pre-pr, commit, push, and PR automation`
- `2026-05-12 | screenshot approved | owner approved the refreshed cadence/timer-goal screenshot handoff in output/habits-v2-build-quit-timed-cadence-2026-05-12-132000 | route/label/support sweep completed for Daily, Weekly, 7-day, today, Timer target, Daily target, timer progress, and /my-library/habits across app/components/lib/tests/docs/runbooks/active briefs; fallout handled in HabitPerfectDayHub, component tests, user-flow map, auth support runbook, and this brief | next: run npm run verify:pre-pr before commit, push, and PR automation`
- `2026-05-12 | implementation merged | PR #686 merged to main as e9a668f feat: add habits v2 build quit timed tracking (#686) | validation: npm run verify:pre-pr PASS; npm run verify:pre-merge PASS; GitHub checks PASS including verify, CodeQL, Vercel, e2e-smoke, site-lock-smoke, deploy-preview, and size-check | next: close this brief via docs-only post-merge closeout`

## Closeout Evidence

- PR: `#686`
- Merge commit: `e9a668f feat: add habits v2 build quit timed tracking (#686)`
- Screenshot artifacts: `output/habits-v2-build-quit-timed-cadence-2026-05-12-132000`
- Captured: `2026-05-12 13:20`
- Screenshot review: approved by owner before `verify:pre-pr`.
- Local gates:
  - `npm run verify:pre-pr`: PASS, full lane.
  - `npm run verify:pre-merge`: PASS, full lane with private-gate regression skipped because `SITE_LOCK_ENABLED!=1`.
- CI gates: PASS for GitHub `verify`, CodeQL, Vercel, deploy-preview, e2e-smoke, site-lock-smoke, and size-check.
- Perf trend decision: held stretch-target tightening for a separate governance slice; this PR used existing budgets and passed with the recorded 20.0% worst margin.
- Remaining gaps: none blocking release for this scoped Habits V2 slice.
- 10/10 claim: yes.

Critical target categories confirmed `5/5`: Product goals and IA, UX flow clarity, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Accessibility (a11y), and Testing and QA automation.

| Target Category                               | Achieved Score | Evidence                                                                                                         |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Build, Quit, and Timed modes implemented in habit creation and compact rows.                                     |
| UX flow clarity                               | `5/5`          | Start-date quit/build flows, Done/Undo, Log slip/Undo slip, and timer progress validated by tests/screenshots.   |
| Visual design quality                         | `5/5`          | Approved mobile/desktop after/reference screenshot handoff with compact and expanded states.                     |
| Business logic correctness and data integrity | `5/5`          | Domain/API tests cover modes, dates, lapses, timers, duplicate writes, resets, and schema-not-ready paths.       |
| Accessibility (a11y)                          | `5/5`          | Existing semantic controls preserved; component tests cover accessible mode/action labels.                       |
| Performance (CWV + payloads)                  | `5/5`          | No new heavy dependency; build and perf budgets passed.                                                          |
| Data placement and sync boundaries            | `5/5`          | Additive Supabase fields, server-canonical definitions/check-ins, and local-only collapsed-row preference.       |
| Caching and invalidation strategy             | `5/5`          | Mutation routes return refreshed habit snapshots after create/update/check-in/lapse/reset.                       |
| Reliability and failure handling              | `5/5`          | Negative-path tests cover invalid input, before-start rejection, unauthenticated access, and recoverable errors. |
| Security and authz                            | `5/5`          | Authenticated owner-scoped routes remain fail-closed with sanitized payloads.                                    |
| Privacy and compliance                        | `5/5`          | Analytics omit habit labels/notes; export includes habit data for user-owned portability.                        |
| Analytics and KPI observability               | `5/5`          | Habit create/update/check-in/reset/lapse/timer events added with redacted mode/cadence metadata.                 |
| Incident response and support operations      | `5/5`          | Support runbook updated for quit days-since, lapse/reset, timer recovery, and sensitive label handling.          |
| i18n operational readiness                    | `5/5`          | Cadence, target, date, days-since, and timer labels use controlled copy and formatted durations.                 |
| Stack-fit and dependency discipline           | `5/5`          | Existing Next.js, TypeScript, Supabase, Tailwind, and test patterns reused; no new dependency added.             |
| Testing and QA automation                     | `5/5`          | Targeted unit/component/API/export/analytics tests plus full `verify:pre-pr`, `verify:pre-merge`, and CI.        |
| Scalability and cost efficiency               | `5/5`          | Indexed additive fields and bounded date-window habit summaries preserve one-row-per-event write shape.          |
| DevOps and rollback readiness                 | `5/5`          | Forward-safe migration, generated DB types, clean PR state, green gates, and revertable merge commit.            |
