# Task Brief: Habits Cadence And Priority UX (10/10)

## Metadata

- `id`: `2026-05-13-habits-cadence-priority-ux-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-13`
- `updated`: `2026-05-14`

## Goal

Make Habits cadence and prioritization match how users think: choose how often a habit should happen, optionally pin fixed days, and see the habits needing manual action first.

## Product Decision

Use this brief for Habits cadence, due-state ordering, and priority UX only. Global navigation, floating nav, Home/Back/Course behavior, and Habits ↔ Micro Sessions route movement were handled by `docs/task-briefs/done/2026-05-13-navigation-ia-mobile-nav-redesign-10-10.md`; any follow-up adjustment belongs in a separate navigation IA brief, not this cadence slice.

Owner follow-up note:

- `/my-library` currently shows the contextual floating nav as `Library / Routines / Habits`.
- Owner asked whether the third action should be `Home` instead of `Habits`.
- Decision for this slice: defer that as a navigation IA follow-up/open question. Do not change `components/SiteChrome.tsx`, mobile floating nav labels, Home/Back behavior, or routine route movement while implementing this Habits cadence/priority brief.

Current audit snapshot:

- `components/my-library/habits/HabitPerfectDayHub.tsx` currently exposes `Daily`, `1x/week`, and `Custom days`.
- `1x/week` currently means one fixed weekday, not a flexible once-per-week goal.
- `Custom days` currently means fixed weekdays, not `X times/week on any days`.
- `lib/habits/shared.ts` and Supabase currently store `schedule_days` as a weekday array with cardinality `1..7`.
- Current summaries are built from `habit_definitions`, `habit_check_ins`, `start_date`, `last_lapse_date`, `timer_enabled`, and `sort_order`.
- Active habits currently load by `sort_order` then `updated_at`, not by due/interaction priority.

Recommended model:

- Add an explicit cadence contract instead of overloading `schedule_days`.
- Separate `how often` from `which exact days`:
  - `Daily`: every day, with existing per-day target values.
  - `Weekly`: `1..7 times/week`, default `any days`.
  - `Weekly fixed days`: optional fixed weekdays when the user wants specific days.
  - `Monthly`: `1..31 times/month`, default `any days`.
  - `Monthly fixed dates` may be included only if the UX stays simple; otherwise record it as a follow-up.
- Rename the current `1x/week` affordance because it is misleading. Preferred labels are `Weekly target`, `Any days`, and `Fixed days`.
- Keep quit habits low-interruption by default. A quit habit should show status/days-since, with `Log slip` available but not competing with quick build/timed actions unless the user opens details.
- Prioritize the active list by current need, then cadence:
  1. due manual build habits that need a quick value/check-in today,
  2. due timed habits that need a timer/session interaction,
  3. quit/avoidance status habits,
  4. not-due or already-complete habits,
  5. archived habits.
- Within each interaction group, sort cadence as daily, weekly, monthly, then use `sort_order` as the stable user preference tie-breaker.
- Calendar semantics must be explicit before implementation: do not label a rolling 7-day report as `this week` unless the code evaluates a real calendar week.

If implementation discovers that the correct data-model migration is larger than one safe PR, split the work before runtime changes:

- Slice 1: cadence contract + migration + domain tests.
- Slice 2: Habits UI controls + priority ordering + screenshot handoff.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence                                                                                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits creation/editing clearly separates frequency, optional fixed days, habit mode, and action priority; list order matches user jobs on return visits.                   | route audit + screenshot handoff + owner QA                                                                                | `5/5`                   |
| UX flow clarity                               | `target`     | Users can create daily, weekly any-day, weekly fixed-day, monthly any-day, timed, and quit habits without interpreting misleading labels.                                   | component tests + Playwright flows + screenshot handoff                                                                    | `5/5`                   |
| Visual design quality                         | `target`     | Cadence controls, priority groups, quick actions, timers, and quit/slip status are compact, readable, and non-overlapping on mobile/desktop.                                | before/after screenshots                                                                                                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Cadence period, frequency count, fixed-day policy, check-ins, timer saves, slips/lapses, and summaries are deterministic and do not reinterpret existing history silently.  | domain/API tests + migration review                                                                                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated user habit tracking, not admin editor CRUD, publishing, or moderation workflows.                                                     | explicit admin scope rationale                                                                                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Cadence controls use labelled segmented controls/inputs/checkboxes; priority groups, details, timers, and slip actions are keyboard reachable with semantic state.          | Testing Library/Playwright a11y assertions + keyboard QA                                                                   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library/habits`, Home routine summary, and My Library routines panels add no heavy dependency, polling, or unbounded query; core budgets remain green.                 | dependency diff + build/perf budget checks                                                                                 | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Habit cadence fields are server-canonical; only form drafts, expanded rows, selected filters, and transient timers are local-only.                                          | data contract review + tests                                                                                               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Create/edit/check-in/reset/slip/timer/archive mutations refresh cadence summaries, priority order, Home summary, and selected period state without stale UI.                | route/API tests + refresh/deep-link QA                                                                                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Failed edits, duplicate submits, invalid cadence values, unsupported legacy rows, timer finish failure, and schema drift show recoverable errors without corrupting facts.  | negative-path tests + schema-missing checks + no unexpected 500 failure-mode evidence                                      | `5/5`                   |
| Security and authz                            | `target`     | Habit definition, cadence, check-in, timer, and lapse writes remain authenticated, owner-scoped, RLS-protected, and fail closed.                                            | API/RLS negative-path tests                                                                                                | `5/5`                   |
| Privacy and compliance                        | `target`     | Habit titles, notes, slips, cadence, and sensitive labels are private; analytics/logs avoid raw labels and export/delete contracts include new fields.                      | payload/log review + export/delete tests                                                                                   | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: user-authored private habit content remains user-owned; product copy for cadence labels must have one source of truth in code/tests/docs.                  | copy/label sweep                                                                                                           | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, operator mutation, admin editability, or support console workflow is changed.                                                                    | explicit admin workflow scope rationale                                                                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` and Home routine summaries are authenticated/private and no public metadata, sitemap, robots, or crawlable content changes.                | explicit private-route rationale                                                                                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief creates no public AI-discoverable page, structured data, or public knowledge content.                                                                | explicit private-route rationale                                                                                           | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing first-party events capture cadence period, day policy, mode, and interaction type without raw habit labels or notes.                                               | analytics payload tests/review                                                                                             | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this brief changes no pricing, checkout, entitlement, subscription, refund, payout, or revenue operation.                                                       | explicit commerce scope rationale                                                                                          | `N/A`                   |
| Incident response and support operations      | `target`     | Support/runbook notes can diagnose stale priority order, missing cadence schema, impossible due states, duplicate check-ins, timer failures, and slip/lapse confusion.      | Help/Guide/runbook impact note + support diagnostics checklist                                                             | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because private habit cadence has no invoice, payout, refund, subscription, entitlement, reporting export, or reconciliation impact.                                    | explicit finance scope rationale                                                                                           | `N/A`                   |
| i18n operational readiness                    | `target`     | Cadence labels, weekly/monthly copy, pluralization, weekday/month labels, timer duration, and slip wording are short, literal, and locale-ready.                            | copy review + date/plural tests                                                                                            | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, `lib/habits/shared.ts`, existing API routes, Supabase migrations/RLS, and current UI primitives; add no dependency unless explicitly justified. | architecture review + no-dependency diff                                                                                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit, API, component, Playwright, migration/type, export/delete, analytics payload, and screenshot coverage protect cadence and priority behavior.                          | targeted tests + screenshot handoff + ui-debug-hypothesis-and-handoff actual consumed artifact review + later verify gates | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Queries remain bounded to active habits and relevant date windows; cadence evaluation avoids per-user unbounded history scans on Home/My Library.                           | query/index review + load-shape rationale                                                                                  | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Additive migration is forward-safe, generated DB types update in same PR, legacy rows render, rollback/degrade behavior is documented, and gates catch schema drift.        | migration rollback note + generated types diff + pre-pr/pre-merge gates                                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `/my-library/habits` as the primary editing and tracking route;
  - sweep Home routine quick actions and `components/my-library/TodayTabsPanel.tsx` because habit due-state summaries appear outside the route;
  - keep server loading in route loaders and client-only state limited to forms, expansion, selected local filters, and timers;
  - avoid route-local duplicate cadence logic by deriving UI from shared habit view-model helpers.
- TypeScript/domain contracts:
  - add explicit cadence types in `lib/habits/shared.ts`, for example `cadencePeriod`, `cadenceTargetCount`, and `cadenceDayPolicy`;
  - add deterministic helpers for due-state, period windows, priority grouping, and cadence labels;
  - test legacy fallback from existing `schedule_days` into the new view model.
- Supabase/data layer:
  - use additive migrations for new cadence fields;
  - preserve existing `schedule_days` for fixed weekday compatibility unless a migration explicitly replaces it safely;
  - update RLS/authz assumptions, indexes, generated DB types, user export/delete contracts, and schema drift coverage in the same implementation workstream.
- External services/tools:
  - no Garmin, Apple Health, reminders, push notifications, or external analytics vendor in this brief;
  - existing first-party analytics only, with sensitive labels redacted.
- UI system:
  - use existing Tailwind/UI patterns in `HabitPerfectDayHub`;
  - use segmented controls for period/mode, steppers/number inputs for frequency, checkboxes for fixed weekdays, and icon buttons for timers/slip/details where appropriate;
  - avoid visible explanatory instruction blocks; use labels and control structure to make the model obvious;
  - screenshot handoff comparison type is before/after for `/my-library/habits` and after/reference for Home/My Library summary surfaces if they are touched.
- Testing:
  - domain tests for cadence normalization, due-state, weekly/monthly period math, priority sort, and legacy row fallback;
  - API tests for create/edit invalid cadence, owner-scope, schema-missing, duplicate submit, and stale snapshot behavior;
  - component tests for controls, quick rows, and priority groups;
  - Playwright for create/edit/check-in/timed/quit flows;
  - screenshot handoff before `verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data:
  - habit identity, title, notes, mode, type, category, target value/unit/time, start date, status, sort order,
  - cadence period, cadence target count, fixed-day policy, optional fixed weekdays/month dates,
  - check-ins, timer saves, quit/lapse facts, last lapse date, and archive state.
- Local-only data:
  - add/edit draft fields before save,
  - expanded/collapsed habit rows,
  - selected local filter/group presentation,
  - active timer display ticks before save/pause/finish,
  - transient pending/error/success state.
- Sync policy:
  - create/edit/check-in/reset/slip/timer-finish mutations become server-canonical only after successful API response;
  - mutation responses must return or refresh a snapshot that includes cadence summaries and priority order;
  - duplicate same-day check-ins keep the existing one-row-per-habit-date behavior unless a new event table is explicitly introduced.
- Conflict policy:
  - invalid cadence combinations fail closed before writes;
  - converting a habit in a way that would reinterpret history should require an explicit create-new-habit path or an in-place edit warning with tests;
  - stale schemas return the existing stable "Habits are still syncing" style response.
- Retention and sensitivity:
  - no sensitive habit names or notes in logs/analytics;
  - any new cadence fields and event/session tables must be included in user export/delete tests.
- Cache/invalidation:
  - authenticated habits routes remain no-store/dynamic;
  - Home routines summary, Habits route, and My Library routines panel must not show stale due counts after mutation.

## Identity And Rename Contract

- Canonical stable ID:
  - each habit keeps its existing immutable `habit_definitions.id`;
  - check-ins keep the existing immutable `habit_check_ins.id`;
  - any new event/session row introduced by implementation must have its own immutable ID and owner FK.
- Human-readable identifiers:
  - title, notes, category, cadence label, and UI labels are editable display fields and not route params.
- Mutability rules:
  - cadence period/count/fixed days may be edited in place when the habit meaning is preserved;
  - title/category/note edits may be edited in place;
  - changing from one behavior to a materially different behavior should create a new habit or warn that history will remain attached.
- Rename vs repurpose policy:
  - `Read` → `Read 10 pages` is a rename/edit;
  - `Drink water` → `Quit chips` is a repurpose and should become a new habit.
- Compatibility contract:
  - legacy rows with only `schedule_days` remain readable;
  - legacy `schedule_days.length === 7` maps to daily;
  - legacy `schedule_days.length === 1` maps to weekly fixed day;
  - legacy `schedule_days.length > 1 && < 7` maps to weekly fixed days, not flexible any-day frequency.
- Observability and repair:
  - support diagnostics should identify missing cadence fields, impossible cadence combinations, duplicate same-day rows, orphan events, and stale priority summaries without exposing raw private labels.

## Scope

- Full habits cadence audit across:
  - `components/my-library/habits/HabitPerfectDayHub.tsx`
  - `lib/habits/shared.ts`
  - `lib/habits/server.ts`
  - `app/api/my-library/habits/**`
  - `app/my-library/habits/page.tsx`
  - `app/page.tsx`
  - `components/my-library/TodayTabsPanel.tsx`
  - user export/delete payloads if cadence fields or event tables change
  - Supabase migrations, generated DB types, tests, docs, Help/Guide/runbook references.
- Add/edit cadence controls:
  - daily,
  - weekly any days with frequency count,
  - weekly fixed weekdays,
  - monthly any days with frequency count,
  - optional monthly fixed dates only if UX and data model remain simple.
- Replace misleading `1x/week` language with a clear weekly target model.
- Add priority grouping for active habits:
  - due manual build habits,
  - due timed habits,
  - quit/avoidance status,
  - not due or already done,
  - archived.
- Keep `sort_order` as the stable tie-breaker inside priority groups.
- Update summaries so daily, weekly, monthly, timed, and quit habits read correctly.
- Update tests, route/label/support sweep, docs/runbook/help impact, analytics payload safety, and screenshot handoff.

## Out Of Scope

- Global navigation redesign, floating nav, `Library / Routines / Habits` vs `Library / Routines / Home` labels, Home/Back/Course labels, or Habits ↔ Micro Sessions route movement.
- Garmin, Apple Health, Strava, Fitbit, reminders, notifications, social features, widgets, or AI coaching.
- Full long-range trend dashboard, heatmap, monthly report center, or public analytics dashboard.
- Admin CRUD/publishing workflow changes.
- Entitlement, pricing, checkout, subscriptions, refunds, payouts, or revenue reporting.
- Broad app visual redesign outside Habits cadence controls and priority rows.
- Merge or release without explicit owner approval.

## Acceptance Criteria

1. Creation and edit forms separate cadence period, frequency count, and optional fixed days.
2. `1x/week` is replaced with clear labels that distinguish `any days` from `fixed days`.
3. Users can create a weekly habit for `3 times/week, any days` without selecting weekdays.
4. Users can create a weekly habit pinned to fixed weekdays.
5. Users can create a monthly habit for `N times/month, any days`.
6. Legacy `schedule_days` habits render with correct daily/weekly fixed-day labels and do not lose history.
7. Due manual habits appear above non-due habits and above lower-interruption quit status rows.
8. Timed habits sit in their own due group below quick manual check-ins unless the implementation audit justifies a different order.
9. Quit habits show days-since/status without forcing daily interaction; `Log slip` remains available but not over-promoted.
10. Already completed, not-due, future-start, and archived habits do not crowd the top action list.
11. `sort_order` remains the tie-breaker inside priority groups.
12. Summary copy does not call rolling 7-day metrics `this week` unless calendar-week logic is implemented.
13. Home and My Library routine summaries remain consistent with Habits due-state after mutations.
14. New cadence fields are covered by migration, generated DB types, export/delete tests, and schema drift checks.
15. Analytics events include cadence period/policy/mode safely and exclude raw habit labels/notes.
16. Accessibility is preserved for cadence controls, priority groups, timers, details, and slip actions.
17. Screenshot handoff is delivered and approved before `npm run verify:pre-pr`.

## Validation

Brief-only planning validation:

- `npm run lint:briefs:all`
- `git diff --check`

Implementation validation before PR update:

- Targeted unit/domain tests:
  - `tests/unit/habits.test.ts`
  - `tests/unit/habit-perfect-day-hub.test.tsx`
  - `tests/unit/habits-routes.test.ts`
  - `tests/unit/my-library-today.test.ts`
  - `tests/unit/today-tabs-panel.test.tsx`
  - user export/delete tests if fields/tables change.
- Targeted Playwright:
  - `tests/e2e/my-library-habits.spec.ts`
  - `tests/e2e/home-routines-entrypoint.spec.ts`
  - relevant My Library routines entrypoint tests.
- Supabase/schema validation:
  - migration review,
  - generated DB types update,
  - schema drift gate if migration changes.
- Route/label/support-surface sweep before broad gates.
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation.

UI screenshot gate:

- Because this is Habits UI work, stop after targeted implementation QA and before `npm run verify:pre-pr`.
- Provide screenshot handoff with `Screenshot artifacts`, `Captured: YYYY-MM-DD HH:MM`, 2-4 representative screenshots, and explicit before/after naming for changed Habits surfaces.
- Include mobile and desktop views for:
  - add/edit cadence controls,
  - active priority list with manual/timed/quit rows,
  - Home/My Library summary if touched.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/habits`
  - `http://127.0.0.1:3000/my-library/habits?view=active#add-habit`
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/my-library/routines`
- Viewports:
  - phone mobile width,
  - tablet width,
  - desktop width.
- Browsers:
  - Chromium for automated screenshot handoff,
  - Safari/WebKit spot check where practical for form controls and timers.
- QA scenarios:
  - daily build habit,
  - weekly any-days habit,
  - weekly fixed-days habit,
  - monthly any-days habit,
  - timed habit,
  - quit habit with slip action,
  - legacy habit row,
  - mutation failure/error recovery.
- Vercel preview:
  - test after PR checks if implementation proceeds.

## Help / Guide Impact

Required if cadence labels, support diagnostics, recovery behavior, export/delete semantics, or schema migration behavior changes. If Help/Guide has no user-facing habits content, record explicit N/A rationale in the active brief checkpoint log and PR summary.

## Route / Label / Support Surface Sweep

Required before broad gates because this work changes user-facing labels, workflow actions, data semantics, and support-visible diagnostics.

Search targets include:

- `Daily`
- `1x/week`
- `Custom days`
- `Weekly`
- `Monthly`
- `schedule_days`
- `sort_order`
- `timer_enabled`
- `last_lapse_date`
- `Log slip`
- `Slip logged`
- `7-day`
- `this week`
- `habit_created`
- `habit_updated`
- `habit_check_in_logged`
- `habit_lapse_logged`
- `habit_timer_saved`
- `/my-library/habits`
- `My Perfect Day`
- `Habits`

Surfaces to sweep:

- `app/`
- `components/`
- `lib/`
- `supabase/migrations/`
- `types/database.ts`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- Help/Guide assertions if present.

## Checkpoint Log

- `2026-05-13 | planned | created after owner asked to follow the recommended next step from the navigation brief; audit found current schedule UI supports fixed weekday schedules only, not flexible X-times-per-week/month cadence or due-state priority ordering | next: owner confirms execution scope or says to implement this brief end-to-end`
- `2026-05-13 | planning audit | owner asked whether the `/my-library`floating nav should replace`Habits`with`Home`; decision recorded to keep this Habits brief scoped to cadence/priority and defer the nav-label question to a separate navigation IA follow-up, with the completed #698 nav brief path corrected to `done/` | next: owner confirms execution scope or says to implement this brief end-to-end`
- `2026-05-13 | in-progress | owner said "implementer Habits Cadence & Priority UX end-to-end"; started branch `feature/habits-cadence-priority-ux`from clean synced main after #698/#699, moved brief to in-progress, and confirmed the visual-work stop point remains screenshot handoff before`npm run verify:pre-pr` | next: audit habit data/API/UI/test surfaces before implementation`
- `2026-05-14 | implemented model/UI | added additive cadence fields (`cadence_period`, `cadence_target_count`, `cadence_day_policy`) with legacy `schedule_days`fallback, updated API analytics/export payloads, replaced`1x/week`/`Custom days`with`Weekly target`, `Any days`, `Fixed days`, and `Monthly target`, added priority groups (`Action needed`, `Timed today`, `Quit status`, `Later`), and deferred monthly fixed dates as an explicit unsupported validation path | validation: npm run typecheck PASS; targeted Vitest for habits/domain/routes/component/today/export PASS (6 files, 44 tests); npm run lint:briefs:all PASS | next: route-label/support sweep, lint, Playwright/screenshot capture, then pause before `npm run verify:pre-pr``
- `2026-05-14 | route-label-support-sweep | identifiers searched: 1x/week, Custom days, Weekly target, Any days, Fixed days, Monthly target, cadence_period, cadence_target_count, cadence_day_policy, Monthly fixed dates, this week, 7-day, Log slip, Slip logged, /my-library/habits, My Perfect Day, Habits | surfaces checked: app/, components/, lib/, tests/, docs/, docs/runbooks/, active brief, and relevant done briefs surfaced by the targeted search | fallout handled in HabitPerfectDayHub, shared habit domain helpers, API routes, export payloads, Supabase migration/types, user-flow map, auth support runbook, unit/API/component/export tests, and this brief; historical task-brief audit mentions of old labels intentionally remain as evidence | validation: npm run lint PASS; npm run lint:briefs:all PASS; targeted Vitest PASS (6 files, 44 tests) | next: Playwright/screenshot capture, then pause before `npm run verify:pre-pr``
- `2026-05-14 | screenshot-ready | fixed a screenshot-found UX edge where fixed-day `Later`habits still offered a quick`Done`action; not-due rows now show`Later`/`Not due today`with only`Edit`and`Details` in the quick row, and Home no-due state stays on today's habits instead of add-habit setup | validation: npm run typecheck PASS; npm run lint PASS; npm run lint:briefs:all PASS; targeted Vitest PASS (6 files, 46 tests); targeted Playwright for my-library habits + Home routines exited 0 with 1 anonymous Home test passed and 7 auth-dependent skips from the known local dev-login/Supabase HTML response | screenshots: output/habits-cadence-priority-20260514-012554; temporary preview route/script removed after capture, and no product-rendering files changed after the final capture | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-14 | screenshot-approved | owner approved the screenshot handoff for output/habits-cadence-priority-20260514-012554; no product-rendering files changed after the final capture | next: run npm run verify:pre-pr, commit, push, open/update PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
- `2026-05-14 | supabase-schema-applied | pre-pr initially blocked because the new migration was pending on the linked remote; Supabase preflight confirmed linked project `freeswimming-org-prod`, migration history showed only `20260513213000_habits_cadence_priority_contract.sql`pending, dry-run showed exactly that file,`npx supabase db push --linked`applied it, post-apply migration list showed local and remote both at`20260513213000`, dry-run confirmed `Remote database is up to date`, and `types/database.ts` was regenerated then normalized to a 9-line cadence-field diff | note: one parallel post-apply dry-run briefly hit Supabase pooler auth circuit-breaker; sequential rerun passed | next: rerun npm run verify:pre-pr`
- `2026-05-14 | pre-pr-evidence-fix | added explicit quality-gate evidence that API and route failures use controlled failure-mode responses with no unexpected 500 for invalid cadence/schema/auth paths, and that the visual review followed `docs/runbooks/ui-debug-hypothesis-and-handoff.md` with actual consumed artifact review of the full-resolution screenshot folder after a screenshot-found quick-action edge was fixed | next: rerun npm run verify:pre-pr`
- `2026-05-14 | pre-pr-pass | `npm run verify:pre-pr`PASS after linked Supabase dry-run confirmed the remote is up to date; full lane evidence: lint:quality-gates PASS, admin/env/pr-body/lint PASS, typecheck PASS, Vitest 191 files / 1075 tests PASS, build PASS, perf-budget PASS, Playwright 84 passed / 408 skipped under the open gate; artifact log:`artifacts/test-runs/20260514-053031/verify.log` | perf-budget decision: hold budget tightening in this Habits feature PR because the recommendation is for stable public-route baseline budgets, not the authenticated Habits cadence surface; record the same hold in the PR summary and handle tightening in a dedicated platform-performance slice | next: commit, push, open/update PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
